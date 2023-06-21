import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Email,
  EmailConversation,
  EmailConversationDocument,
} from '../schemas';

@Injectable()
export class EmailSessionManagerService {
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}
  async createEmailConversation(
    email: Email,
  ): Promise<EmailConversationDocument> {
    return this.model.create({
      CreationTime: new Date(),
      SenderName: email.SenderName,
      TenantId: email.TenantId,
      FromEmail: email.FromEmail,
      ToEmail: email.ToEmail,
      CcEmail: email.CcEmail,
      BccEmail: email.BccEmail,
    });
  }
}
