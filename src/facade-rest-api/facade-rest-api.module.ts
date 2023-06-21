import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AcdCqrsModule } from '../cqrs/acd-cqrs.module';
import { MessageManagerApiController } from './message-api.controller';
import { ConversationManagerApiController } from './conversation-api.controller';
import { EmailManagerApiController } from './email-api.controller';

@Module({
  imports: [CqrsModule, AcdCqrsModule],
  controllers: [
    ConversationManagerApiController,
    MessageManagerApiController,
    EmailManagerApiController,
  ],
})
export class FacadeRestApiModule {}
