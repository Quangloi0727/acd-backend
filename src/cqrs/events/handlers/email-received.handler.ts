import {
  IEventHandler,
  EventsHandler,
  CommandBus,
  QueryBus,
} from '@nestjs/cqrs';
import { LoggingService } from '../../../providers/logging';
import {
  EventPublisherCommand,
  NotifyNewEmailToAgentCommand,
  SaveEmailCommand,
} from '../..';
import {
  Email,
  EmailConversationDocument,
  EmailDocument,
} from '../../../schemas';
import { Inject } from '@nestjs/common';
import { KafkaClientService, KafkaService } from '../../../providers/kafka';
import { EmailReceivedEvent } from '../email-received.event';
import { EmailSessionManagerService } from '../../../email-session-manager';
import { EmailSessionRegistryService } from '../../../email-session-registry';
import { KAFKA_TOPIC_MONITOR, NotifyEventType } from '../../../common/enums';

@EventsHandler(EmailReceivedEvent)
export class EmailReceivedEventHandler
  implements IEventHandler<EmailReceivedEvent>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly emailSessionManagerService: EmailSessionManagerService,
    private readonly emailSessionRegistryService: EmailSessionRegistryService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
  ) {}

  async handle(event: EmailReceivedEvent) {
    const email = Email.fromDto(event.email);
    this.loggingService.debug(
      EmailReceivedEventHandler,
      `Received a email from : ${email.FromEmail}, to: ${email.ToEmail}`,
    );

    // parse subject to get conversation id
    const conversationId =
      this.emailSessionRegistryService.getConversationIdFromSubject(
        email.Subject,
      );

    let conversation: EmailConversationDocument = null;
    // find conversation by id
    if (conversationId) {
      conversation =
        await this.emailSessionRegistryService.getEmailConversationById(
          conversationId,
        );
    }

    // if not exist conversation -> create new conversations and create subject with conversationid tag
    if (!conversation) {
      conversation =
        await this.emailSessionManagerService.createEmailConversation(email);
      conversation.Subject = email.Subject;
      conversation.SpamMarked =
        await this.emailSessionRegistryService.checkEmailSpam(
          email.TenantId,
          email.FromEmail,
        );
      await conversation.save();
    }

    // Assign agent for email
    const conversationAssigned =
      await this.emailSessionRegistryService.assignAgentToSession(
        conversation._id,
        conversation.ToEmail,
        conversation.TenantId,
        conversation.AgentId,
      );
    await this.loggingService.debug(
      EmailReceivedEventHandler,
      `response from grpc agent assignment is: ${JSON.stringify(
        conversationAssigned,
      )}`,
    );

    email.conversationId = conversation._id;
    conversation.Readed = false;
    conversation.Reader = undefined;
    conversation.ReadedTime = undefined;

    conversation.Content = email.Content;
    conversation.TimeReply = new Date(
      email.ReceivedTime.getTime() + 10 * 60000,
    ); // sla reply after 10 mins
    await conversation.save();
    // save email
    const emailSaved = await this.commandBus.execute<
      SaveEmailCommand,
      EmailDocument
    >(new SaveEmailCommand(email));
    await this.commandBus.execute(
      new EventPublisherCommand(KAFKA_TOPIC_MONITOR.EMAIL_RECEIVED, {
        AgentId: conversationAssigned?.agentId
          ? Number(conversationAssigned?.agentId)
          : null,
        TenantId: email.TenantId,
        ConversationId: conversation.id,
        EmailId: emailSaved.id,
        FromEmail: email.FromEmail,
        ToEmail: email.ToEmail,
        CcEmail: email.CcEmail,
        BccEmail: email.BccEmail,
        SenderName: email.SenderName,
        Subject: email.Subject,
        Content: email.Content,
        Timestamp: email.ReceivedTime.getTime(),
      }),
    );

    // notify to agent
    if (conversationAssigned?.agentId) {
      await this.commandBus.execute(
        new EventPublisherCommand(KAFKA_TOPIC_MONITOR.EMAIL_ASSIGNED, {
          AgentId: Number(conversationAssigned.agentId),
          TenantId: email.TenantId,
          ConversationId: conversation.id,
          FromEmail: email.FromEmail,
          ToEmail: email.ToEmail,
          CcEmail: email.CcEmail,
          BccEmail: email.BccEmail,
          SenderName: email.SenderName,
          Subject: email.Subject,
          Content: email.Content,
          Timestamp: email.ReceivedTime.getTime(),
        }),
      );
      if (!conversation.SpamMarked)
        await this.commandBus.execute(
          new NotifyNewEmailToAgentCommand({
            Message: 'Một email mới vừa được phân công',
            ListUserReceivedNotify: [Number(conversationAssigned.agentId)],
            TenantId: conversation.TenantId,
            Type: NotifyEventType.EMAIL_ASSIGNMENT,
          }),
        );
    }
  }
}
