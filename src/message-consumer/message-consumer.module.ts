import { Module } from '@nestjs/common';
import { MessageConsumerController } from './message-consumer.controller';

@Module({
  imports: [],
  controllers: [MessageConsumerController],
})
export class MessageConsumerModule {}
