import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  KafkaClientService,
  KafkaService,
  SubscribeTo,
} from '../providers/kafka';
import { MessageDto } from './dto/message.dto';
import { KAFKA_TOPIC } from '../constants';
import { MessageReceivedEvent } from './events/message-received.event';
import { MessageConsumerService } from './message-consumer.service';

@Controller()
export class MessageConsumerController implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    private readonly messageConsumerService: MessageConsumerService,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
  ) {}

  onModuleInit() {
    this.kafkaService.subscribeToResponseOf(
      KAFKA_TOPIC.CONNECTOR_MESSAGE_RECEIVED,
      this,
    );
  }

  @SubscribeTo(KAFKA_TOPIC.CONNECTOR_MESSAGE_RECEIVED)
  async onMessageReceived(data: MessageDto): Promise<void> {
    const message = await this.messageConsumerService.saveMessage(data);
    this.eventBus.publish(new MessageReceivedEvent(message._id));
  }
}
