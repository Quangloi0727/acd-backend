import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../schemas';
import { AssignmentClient } from '../providers/grpc/grpc.module';
import { AgentAssignmentServiceClient } from '../protos/assignment.pb';
import { lastValueFrom } from 'rxjs';
import { ConversationType } from '../common/enums';

@Injectable()
export class EmailSessionRegistryService {
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
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
    tenantId: number
  ) {
    try {
      const availableAgentId = await lastValueFrom(
        this.agentAssignmentServiceClient.assignAgentToConversation({
          conversationId: conversationId,
          tenantId: tenantId,
          applicationId: applicationId,
          type: ConversationType.EMAIL,
          lastAgentId: null
        }),
      );
      return availableAgentId;
    } catch (error) {
      return error;
    }
  }
}
