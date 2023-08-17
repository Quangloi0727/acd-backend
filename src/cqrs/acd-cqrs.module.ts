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
  EmailConversation,
  EmailConversationSchema,
  EmailSchema,
  EmailSpam,
  EmailSpamSchema,
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
  CountByChannelsAndStatesCommandHandler,
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
  GetEmailConversationsCommandHandler,
  CountEmailConversationCommandHandler,
  GetEmailDetailCommandHandler,
  MarkEmailAsReadCommandHandler,
  MarkEmailAsSpamCommandHandler,
  MarkEmailAsUnreadCommandHandler,
  AssignAgentToConversationCommandHandler,
  NotifyNewEmailToAgentCommandHandler,
  EventPublisherCommandHandler,
} from './commands';
import {
  EmailReceivedEventHandler,
  MessageReceivedEventHandler,
} from './events';
import {
  ChatHistoryQueryHandler,
  ParticipantQueryHandler,
  TenantByApplicationQueryHandler,
  GetConversationByIdQueryHandler
} from './queries';
import { EmailSessionManagerModule } from 'src/email-session-manager';
import { EmailSessionRegistryModule } from 'src/email-session-registry';
import { EmailSessionSupervisingModule } from 'src/email-session-supervising';
import { ChatSessionTrackerModule } from 'src/chat-session-tracker'

const handlers = [
  SaveMessageCommandHandler,
  SaveConversationCommandHandler,
  SendMessageCommandHandler,
  NotifyNewMessageToAgentCommandHandler,
  PickConversationCommandHandler,
  CloseConversationCommandHandler,
  FindByChannelsAndStatesCommandHandler,
  CountByChannelsAndStatesCommandHandler,
  FindBySenderCommandHandler,
  MessageReceivedEventHandler,
  ChatHistoryQueryHandler,
  GetConversationByIdQueryHandler,
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
  GetEmailConversationsCommandHandler,
  CountEmailConversationCommandHandler,
  GetEmailDetailCommandHandler,
  MarkEmailAsReadCommandHandler,
  MarkEmailAsSpamCommandHandler,
  MarkEmailAsUnreadCommandHandler,
  AssignAgentToConversationCommandHandler,
  NotifyNewEmailToAgentCommandHandler,
  EventPublisherCommandHandler,
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
      { name: EmailConversation.name, schema: EmailConversationSchema },
      { name: EmailSpam.name, schema: EmailSpamSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    ChatSessionManagerModule,
    ChatSessionRegistryModule,
    ChatSessionSupervisingModule,
    ChatSessionTrackerModule,
    EmailSessionManagerModule,
    EmailSessionRegistryModule,
    EmailSessionSupervisingModule,
  ],
  providers: [...handlers],
  exports: [...handlers],
})
export class AcdCqrsModule {}
