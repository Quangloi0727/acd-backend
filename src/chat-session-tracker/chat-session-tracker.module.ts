import { Module } from '@nestjs/common';
import { ChatSessionTrackerService } from './chat-session-tracker.service'
import { LoggingModule } from '../providers/logging'
import { MongooseModule } from '@nestjs/mongoose'
import { Conversation, ConversationSchema, Tenant, TenantSchema } from '../schemas'
import { ScheduleModule } from '@nestjs/schedule'
import { ConfigModule } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { ChatSessionManagerModule } from 'src/chat-session-manager'

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MongooseModule.forFeature([
            { name: Conversation.name, schema: ConversationSchema },
            { name: Tenant.name, schema: TenantSchema },
        ]),
        LoggingModule,
        ConfigModule,
        CqrsModule,
        ChatSessionManagerModule
    ],
    providers: [ChatSessionTrackerService],
    exports: [ChatSessionTrackerService],
})

export class ChatSessionTrackerModule {}
