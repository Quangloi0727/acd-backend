import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailConversation,
  EmailConversationDocument,
  EmailSpam,
  EmailSpamDocument,
} from '../schemas';
import { AssignmentClient } from '../providers/grpc/grpc.module';
import { AgentAssignmentServiceClient } from '../protos/assignment.pb';
import { lastValueFrom } from 'rxjs';
import { ConversationType } from '../common/enums';

@Injectable()
export class EmailSessionRegistryService {
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
    @InjectModel(EmailSpam.name)
    private readonly emailSpamModel: Model<EmailSpamDocument>,
    @Inject(AssignmentClient)
    private agentAssignmentServiceClient: AgentAssignmentServiceClient,
  ) {}
  getConversationIdFromSubject(subject: string): string {
    if (!subject) return undefined;
    const regex = /#(\w+)/;
    const match = subject.replace('Re: ', '').replace('Re:', '').match(regex);

    if (match) {
      return match[1].toLowerCase();
    }
    return undefined;
  }

  getEmailConversationById(
    conversationId: string,
  ): Promise<EmailConversationDocument> {
    return this.model
      .findOne({
        _id: conversationId,
      })
      .exec();
  }

  async assignAgentToSession(
    conversationId: string,
    applicationId: string,
    tenantId: number,
    lastAgentId: number,
  ) {
    try {
      const availableAgentId = await lastValueFrom(
        this.agentAssignmentServiceClient.assignAgentToConversation({
          conversationId: conversationId,
          tenantId: tenantId,
          applicationId: applicationId,
          type: ConversationType.EMAIL,
          lastAgentId: lastAgentId,
        }),
      );
      return availableAgentId;
    } catch (error) {
      return error;
    }
  }

  async checkEmailSpam(tenantId: number, email: string): Promise<boolean> {
    const email_spam = await this.emailSpamModel
      .findOne({
        TenantId: tenantId,
        Email: email,
      })
      .exec();
    console.log('email: ' + email + ' is spam: ' + (email_spam !== null));
    return email_spam !== null;
  }
}
