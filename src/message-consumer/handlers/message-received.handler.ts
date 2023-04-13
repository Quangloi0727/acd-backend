import { Inject } from '@nestjs/common';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { MessageReceivedEvent } from '../events/message-received.event';
import { LoggingService } from '../../providers/logging';
import { ChatSessionManagerService } from '../../chat-session-manager';
import { ChatSessionRegistryService } from '../../chat-session-registry';
import { KafkaClientService, KafkaService } from '../../providers/kafka';
import { KAFKA_TOPIC } from '../../constants';

@EventsHandler(MessageReceivedEvent)
export class MessageReceivedEventHandler
  implements IEventHandler<MessageReceivedEvent>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly chatSessionManagerService: ChatSessionManagerService,
    private readonly chatSessionRegistryService: ChatSessionRegistryService,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
  ) {}
  async handle(event: MessageReceivedEvent) {
    await this.loggingService.debug(
      MessageReceivedEventHandler,
      `Received a message: ${JSON.stringify(event)}`,
    );
    let conversation = await this.chatSessionRegistryService.getSession(
      event.messageId,
    );

    if (!conversation) {
      conversation = await this.chatSessionManagerService.createSession(
        event.messageId,
      );
    }

    await this.chatSessionManagerService.assignAgentToSession(
      conversation._id,
      conversation.tenantId,
    );

    await this.chatSessionRegistryService.saveSession(conversation);
    // notify to agent
    await this.kafkaService.send(conversation, KAFKA_TOPIC.NOTIFY_NEW_MESSAGE);
  }
}
