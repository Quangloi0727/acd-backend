import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  KafkaClientService,
  KafkaService,
  SubscribeTo,
} from '../providers/kafka';
import { MessageDto } from './dto/message.dto';
import { KAFKA_TOPIC } from '../common/enums';
import { MessageReceivedEvent } from '../cqrs';

@Controller()
export class MessageConsumerController implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
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
    this.eventBus.publish(new MessageReceivedEvent(data));
  }
}
