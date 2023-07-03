import {
  IEventHandler,
  EventsHandler,
  CommandBus,
  QueryBus,
} from '@nestjs/cqrs';
import { LoggingService } from '../../../providers/logging';
import { NotifyNewEmailToAgentCommand, SaveEmailCommand } from '../..';
import { Email, EmailConversationDocument } from '../../../schemas';
import { Inject } from '@nestjs/common';
import { KafkaClientService, KafkaService } from '../../../providers/kafka';
import { EmailReceivedEvent } from '../email-received.event';
import { EmailSessionManagerService } from '../../../email-session-manager';
import { EmailSessionRegistryService } from '../../../email-session-registry';
import { NotifyEventType } from '../../../common/enums';

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
      conversation.save();
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
    await conversation.save();
    // save email
    await this.commandBus.execute(new SaveEmailCommand(email));

    // notify to agent
    if (conversationAssigned?.agentId)
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
