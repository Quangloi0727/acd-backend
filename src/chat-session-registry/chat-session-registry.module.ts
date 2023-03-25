import { Module } from '@nestjs/common';
import { ChatSessionRegistryController } from './chat-session-registry.controller';

@Module({
  imports: [],
  controllers: [ChatSessionRegistryController],
})
export class ChatSessionRegistryModule {}
