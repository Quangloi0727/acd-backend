import {
  IEventHandler,
  EventsHandler,
  CommandBus,
  QueryBus,
} from '@nestjs/cqrs';
import { MessageReceivedEvent } from '../message-received.event';
import { LoggingService } from '../../../providers/logging';
import { ChatSessionManagerService } from '../../../chat-session-manager';
import { ChatSessionRegistryService } from '../../../chat-session-registry';
import {
  ConversationState,
  KAFKA_TOPIC_MONITOR,
  MessageStatus,
  NotifyEventType,
  ParticipantType,
} from '../../../common/enums';
import {
  NotifyNewMessageToAgentCommand,
  SaveEmailCommand,
  SaveMessageCommand,
  TenantByApplicationQuery,
} from '../..';
import { Email, Message, Tenant } from '../../../schemas';
import { Inject } from '@nestjs/common';
import { KafkaClientService, KafkaService } from '../../../providers/kafka';
import { EmailReceivedEvent } from '../email-received.event';

@EventsHandler(EmailReceivedEvent)
export class EmailReceivedEventHandler
  implements IEventHandler<EmailReceivedEvent>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly chatSessionManagerService: ChatSessionManagerService,
    private readonly chatSessionRegistryService: ChatSessionRegistryService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
  ) {}

  async handle(event: EmailReceivedEvent) {
    await this.loggingService.debug(
      EmailReceivedEventHandler,
      `Received a email from kafka: ${JSON.stringify(event)}`,
    );

    // parse subject to get conversation id
    const subject = event.email.subject;
    if (subject) {
    }

    const email = await this.commandBus.execute(
      new SaveEmailCommand(Email.fromDto(event.email)),
    );
    this.loggingService.debug(
      EmailReceivedEventHandler,
      `email: ${JSON.stringify(email)}`,
    );
    // find conversation by id

    // if not exist conversation -> create new conversations and create subject with conversationid tag

    // else set conversation for email

    // save email

    // Request assign agent for email

    // notify to agent
  }
}
