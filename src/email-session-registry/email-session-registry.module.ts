import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Email,
  EmailConversation,
  EmailConversationSchema,
  EmailSchema,
  EmailSpam,
  EmailSpamSchema,
} from '../schemas';
import { LoggingModule } from '../providers/logging';
import { EmailSessionRegistryService } from './email-session-registry.service';
import { GrpcModule } from '../providers/grpc/grpc.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: EmailConversation.name, schema: EmailConversationSchema },
      { name: EmailSpam.name, schema: EmailSpamSchema },
    ]),
    GrpcModule,
    LoggingModule,
  ],
  providers: [EmailSessionRegistryService],
  exports: [EmailSessionRegistryService],
})
export class EmailSessionRegistryModule {}
