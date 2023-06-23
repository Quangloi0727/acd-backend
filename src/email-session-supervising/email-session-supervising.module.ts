import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from '../schemas';
import { LoggingModule } from '../providers/logging';
import { EmailSessionSupervisingService } from './email-session-supervising.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }]),
    LoggingModule,
  ],
  providers: [EmailSessionSupervisingService],
  exports: [EmailSessionSupervisingService],
})
export class EmailSessionSupervisingModule {}
