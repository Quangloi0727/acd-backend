import { Module } from '@nestjs/common';
import { ChatSessionRegistryService } from './chat-session-registry.service';

@Module({
  providers: [ChatSessionRegistryService],
  exports: [ChatSessionRegistryService],
})
export class ChatSessionRegistryModule {}
