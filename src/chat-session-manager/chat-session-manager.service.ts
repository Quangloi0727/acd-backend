import { Inject, Injectable } from '@nestjs/common';
import { AssignmentClient } from '../providers/grpc/grpc.module';
import { AgentAssignmentServiceClient } from '../protos/assignment.pb';
import { Conversation } from '../schemas/conversation.schema';
import { ConversationState } from '../common/enums';
import { Message } from '../schemas';

@Injectable()
export class ChatSessionManagerService {
  constructor(
    @Inject(AssignmentClient)
    private agentAssignmentService: AgentAssignmentServiceClient,
  ) {}

  async createConversation(message: Message): Promise<Conversation> {
    return new Conversation({
      senderId: message.senderId,
      senderName: message.senderName,
      applicationId: message.applicationId,
      conversationState: ConversationState.OPEN,
      tenantId: message.tenantId,
      cloudTenantId: message.cloudTenantId,
      channel: message.channel,
      lastText: message.text,
      startedBy: message.messageFrom,
      startedTime: message.receivedTime,
    });
  }

  async assignAgentToSession(conversationId: string, tenantId: number) {
    const availableAgentId =
      await this.agentAssignmentService.assignAgentToConversation({
        conversationId: conversationId,
        tenantId: tenantId,
      });

    return availableAgentId;
  }
}
