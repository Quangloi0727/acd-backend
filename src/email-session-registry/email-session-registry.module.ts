import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Email,
  EmailConversation,
  EmailConversationSchema,
  EmailSchema,
} from '../schemas';
import { LoggingModule } from '../providers/logging';
import { EmailSessionRegistryService } from './email-session-registry.service';
import { GrpcModule } from '../providers/grpc/grpc.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: EmailConversation.name, schema: EmailConversationSchema },
    ]),
    GrpcModule,
    LoggingModule,
  ],
  providers: [EmailSessionRegistryService],
  exports: [EmailSessionRegistryService],
})
export class EmailSessionRegistryModule {}
