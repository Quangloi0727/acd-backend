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
  Email,
  EmailSchema,
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
  LeaveConversationCommandHandler,
  SendEmailCommandHandler,
  SaveEmailCommandHandler,
} from './commands';
import {
  EmailReceivedEventHandler,
  MessageReceivedEventHandler,
} from './events';
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
  LeaveConversationCommandHandler,
  EmailReceivedEventHandler,
  SendEmailCommandHandler,
  SaveEmailCommandHandler,
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
      { name: Email.name, schema: EmailSchema },
    ]),
    ChatSessionManagerModule,
    ChatSessionRegistryModule,
    ChatSessionSupervisingModule,
  ],
  providers: [...handlers],
  exports: [...handlers],
})
export class AcdCqrsModule {}
