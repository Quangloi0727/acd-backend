import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  KafkaClientService,
  KafkaService,
  SubscribeTo,
} from '../providers/kafka';
import { EmailDto } from './dto/email.dto';
import { KAFKA_TOPIC } from '../common/enums';
import { EmailReceivedEvent } from '../cqrs';

@Controller()
export class EmailConsumerController implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
  ) {}

  onModuleInit() {
    this.kafkaService.subscribeToResponseOf(
      KAFKA_TOPIC.NEW_EMAIL_RECEIVED,
      this,
    );
  }

  @SubscribeTo(KAFKA_TOPIC.NEW_EMAIL_RECEIVED)
  async onEmailReceived(email: EmailDto): Promise<void> {
    this.eventBus.publish(new EmailReceivedEvent(email));
  }
}
