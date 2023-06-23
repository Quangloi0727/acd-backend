import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Email,
  EmailConversation,
  EmailConversationSchema,
  EmailSchema,
} from '../schemas';
import { LoggingModule } from '../providers/logging';
import { EmailSessionManagerService } from './email-session-manager.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: EmailConversation.name, schema: EmailConversationSchema },
    ]),
    LoggingModule,
  ],
  providers: [EmailSessionManagerService],
  exports: [EmailSessionManagerService],
})
export class EmailSessionManagerModule {}
