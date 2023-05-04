import { Inject, Injectable } from '@nestjs/common'
import { AssignmentClient, ZaloConnectorClient } from '../providers/grpc/grpc.module'
import { AgentAssignmentServiceClient } from '../protos/assignment.pb'
import { Conversation } from '../schemas/conversation.schema'
import { ConversationState } from '../common/enums'
import { Message } from '../schemas'
import { SendMessageCommand } from '../cqrs/commands/send-message.command'
import { ZaloConnectorServiceClient } from '../protos/zalo-connector.pb'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class ChatSessionManagerService {
  constructor(
    @Inject(AssignmentClient)
    private agentAssignmentServiceClient: AgentAssignmentServiceClient,
    @Inject(ZaloConnectorClient)
    private zaloConnectorService: ZaloConnectorServiceClient,
  ) { }

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
      numOfParticipants: 1,
      numOfMessages: 1,
      lastTime: new Date(),
      lastActionTime: new Date(),
      participants: [message.senderId],
    })
  }

  async assignAgentToSession(conversationId: string, tenantId: number) {
    try {
      const availableAgentId = await lastValueFrom(
        this.agentAssignmentServiceClient.assignAgentToConversation({
          conversationId: conversationId,
          tenantId: tenantId,
        }))
      return availableAgentId
    } catch (error) {
      return error
    }
  };

  async requestSendMessageToZaloConnector(command: SendMessageCommand) {
    return lastValueFrom(this.zaloConnectorService.sendMessageToZalo(command))
  }
}
