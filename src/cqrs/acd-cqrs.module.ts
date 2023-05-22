import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggingModule } from '../providers/logging';
import { ChatSessionManagerModule } from '../chat-session-manager';
import { ChatSessionRegistryModule } from '../chat-session-registry';
import { ChatSessionSupervisingModule } from '../chat-session-supervising';
import {
  Conversation,
  ConversationSchema,
  Message,
  MessageSchema,
  Participant,
  ParticipantSchema,
  Tenant,
  TenantSchema,
} from '../schemas';
import {
  NotifyNewMessageToAgentCommandHandler,
  SaveConversationCommandHandler,
  SaveMessageCommandHandler,
  SendMessageCommandHandler,
  PickConversationCommandHandler,
  FindByChannelsAndStatesCommandHandler,
  FindBySenderCommandHandler,
  CloseConversationCommandHandler,
  CountConversationOpenCommandHandler,
  ReopenConversationCommandHandler,
  JoinConversationCommandHandler,
  TransferConversationCommandHandler,
  UnassignConversationCommandHandler,
} from './commands';
import { MessageReceivedEventHandler } from './events';
import {
  ChatHistoryQueryHandler,
  ParticipantQueryHandler,
  TenantByApplicationQueryHandler,
} from './queries';

const handlers = [
  SaveMessageCommandHandler,
  SaveConversationCommandHandler,
  SendMessageCommandHandler,
  NotifyNewMessageToAgentCommandHandler,
  PickConversationCommandHandler,
  CloseConversationCommandHandler,
  FindByChannelsAndStatesCommandHandler,
  FindBySenderCommandHandler,
  MessageReceivedEventHandler,
  ChatHistoryQueryHandler,
  ParticipantQueryHandler,
  TenantByApplicationQueryHandler,
  CountConversationOpenCommandHandler,
  ReopenConversationCommandHandler,
  JoinConversationCommandHandler,
  TransferConversationCommandHandler,
  UnassignConversationCommandHandler,
];

@Module({
  imports: [
    CqrsModule,
    LoggingModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: Participant.name, schema: ParticipantSchema },
    ]),
    ChatSessionManagerModule,
    ChatSessionRegistryModule,
    ChatSessionSupervisingModule,
  ],
  providers: [...handlers],
  exports: [...handlers],
})
export class AcdCqrsModule {}
