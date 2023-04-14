import { Module } from '@nestjs/common';
import { ChatSessionRegistryService } from './chat-session-registry.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from '../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  providers: [ChatSessionRegistryService],
  exports: [ChatSessionRegistryService],
})
export class ChatSessionRegistryModule {}
