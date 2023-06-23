import {
  IEventHandler,
  EventsHandler,
  CommandBus,
  QueryBus,
} from '@nestjs/cqrs';
import { MessageReceivedEvent } from '../message-received.event';
import { LoggingService } from '../../../providers/logging';
import { SaveEmailCommand } from '../..';
import { Email, EmailConversationDocument } from '../../../schemas';
import { Inject } from '@nestjs/common';
import { KafkaClientService, KafkaService } from '../../../providers/kafka';
import { EmailReceivedEvent } from '../email-received.event';
import { EmailSessionManagerService } from '../../../email-session-manager';
import { EmailSessionRegistryService } from '../../../email-session-registry';

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
      `Received a email: ${JSON.stringify(email)}`,
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
      conversation.save();
      // Assign agent for email
      const conversationAssigned =
        await this.emailSessionRegistryService.assignAgentToSession(
          conversation._id,
          conversation.ToEmail,
          conversation.TenantId,
        );
      await this.loggingService.debug(
        EmailReceivedEventHandler,
        `response from grpc agent assignment is: ${JSON.stringify(
          conversationAssigned,
        )}`,
      );
    }

    email.conversationId = conversation._id;
    // save email
    await this.commandBus.execute(new SaveEmailCommand(email));

    // notify to agent
  }
}
