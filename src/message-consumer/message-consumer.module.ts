import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MessageConsumerController } from './message-consumer.controller';
import { ChatSessionRegistryModule } from '../chat-session-registry';
import { ChatSessionManagerModule } from '../chat-session-manager';
import { MessageConsumerService } from './message-consumer.service';
import { LoggingModule } from '../providers/logging';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../schemas/message.schema';
import { MessageReceivedEventHandler } from './handlers/message-received.handler';

export const eventHandlers = [MessageReceivedEventHandler];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    CqrsModule,
    LoggingModule,
    ChatSessionRegistryModule,
    ChatSessionManagerModule,
  ],
  controllers: [MessageConsumerController],
  providers: [...eventHandlers, MessageConsumerService],
})
export class MessageConsumerModule {}
