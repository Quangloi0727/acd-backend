import { Module } from '@nestjs/common';
import { GrpcModule } from '../providers/grpc/grpc.module';
import { ChatSessionManagerService } from './chat-session-manager.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from '../schemas/conversation.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { ChatSessionManagerApiController } from './chat-session-manager.controller'
import { CqrsModule } from '@nestjs/cqrs'
@Module({
  imports: [
    CqrsModule,
    GrpcModule,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ChatSessionManagerApiController],
  providers: [ChatSessionManagerService],
  exports: [ChatSessionManagerService],
})
export class ChatSessionManagerModule {}
