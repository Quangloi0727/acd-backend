import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MessageConsumerController } from './message-consumer.controller';
import { AcdCqrsModule } from '../cqrs/acd-cqrs.module';
import { EmailConsumerController } from './email-consumer.controller';

@Module({
  imports: [CqrsModule, AcdCqrsModule],
  controllers: [MessageConsumerController, EmailConsumerController],
})
export class MessageConsumerModule {}
