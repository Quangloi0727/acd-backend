import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MessageConsumerController } from './message-consumer.controller';
import { AcdCqrsModule } from '../cqrs/acd-cqrs.module';

@Module({
  imports: [CqrsModule, AcdCqrsModule],
  controllers: [MessageConsumerController],
})
export class MessageConsumerModule {}
