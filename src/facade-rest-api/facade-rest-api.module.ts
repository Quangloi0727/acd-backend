import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FacadeRestApiController } from './facade-rest-api.controller';
import { ChatHistoryQueryHandler } from './handlers/history-query.handler';
import { SendMessageCommandHandler } from './handlers/send-message.handler';
import { ChatSessionManagerModule } from 'src/chat-session-manager';

const handlers = [ChatHistoryQueryHandler, SendMessageCommandHandler];

@Module({
  imports: [CqrsModule, ChatSessionManagerModule],
  providers: [...handlers],
  controllers: [FacadeRestApiController],
})
export class FacadeRestApiModule {}
