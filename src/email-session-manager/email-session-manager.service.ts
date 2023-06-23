import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Email,
  EmailConversation,
  EmailConversationDocument,
} from '../schemas';
import { lastValueFrom } from 'rxjs';
import { EmailConnectorClient } from '../providers/grpc/grpc.module';
import {
  EmailServiceClient,
  SendEmailRequest,
} from '../protos/email-connector.pb';

@Injectable()
export class EmailSessionManagerService {
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
    @Inject(EmailConnectorClient)
    private emailConnectorClient: EmailServiceClient,
  ) {}
  async createEmailConversation(
    email: Email,
  ): Promise<EmailConversationDocument> {
    return this.model.create({
      CreationTime: new Date(),
      ReceivedTime: email.ReceivedTime,
      SenderName: email.SenderName,
      TenantId: email.TenantId,
      FromEmail: email.FromEmail,
      ToEmail: email.ToEmail,
      CcEmail: email.CcEmail,
      BccEmail: email.BccEmail,
    });
  }

  async sendEmail(request: SendEmailRequest) {
    return lastValueFrom(this.emailConnectorClient.sendEmail(request));
  }
}
