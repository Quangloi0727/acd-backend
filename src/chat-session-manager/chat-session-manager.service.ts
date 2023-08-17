import { Inject, Injectable } from '@nestjs/common'
import { AssignmentClient, FacebookConnectorClient, TelegramConnectorClient, ViberConnectorClient, WSConnectorClient, ZaloConnectorClient } from '../providers/grpc/grpc.module'
import { AgentAssignmentServiceClient } from '../protos/assignment.pb'
import { Conversation } from '../schemas/conversation.schema'
import { ConversationState, ConversationType } from '../common/enums'
import { Message } from '../schemas'
import { SendMessageCommand } from '../cqrs/commands/send-message.command'
import { ZaloConnectorServiceClient } from '../protos/zalo-connector.pb'
import { lastValueFrom } from 'rxjs'
import { FacebookConnectorServiceClient } from '../protos/facebook-connector.pb'
import { WhatSappConnectorServiceClient } from 'src/protos/ws-connector.pb'
import { ViberConnectorServiceClient } from 'src/protos/viber-connector.pb'
import { TelegramConnectorServiceClient } from 'src/protos/telegram-connector.pb'

@Injectable()
export class ChatSessionManagerService {
  constructor(
    @Inject(AssignmentClient)
    private agentAssignmentServiceClient: AgentAssignmentServiceClient,
    @Inject(ZaloConnectorClient)
    private zaloConnectorService: ZaloConnectorServiceClient,
    @Inject(FacebookConnectorClient)
    private facebookConnectorService: FacebookConnectorServiceClient,
    @Inject(ViberConnectorClient)
    private viberConnectorService: ViberConnectorServiceClient,
    @Inject(WSConnectorClient)
    private whatSappConnectorService: WhatSappConnectorServiceClient,
    @Inject(TelegramConnectorClient)
    private telegramConnectorService: TelegramConnectorServiceClient,
  ) { }

  async createConversation(message: Message): Promise<Conversation> {
    return new Conversation({
      senderId: message.senderId,
      senderName: message.senderName,
      applicationId: message.applicationId,
      applicationName: message.applicationName,
      conversationState: ConversationState.OPEN,
      cloudTenantId: message.cloudTenantId,
      channel: message.channel,
      startedTime: new Date(),
      lastTime: new Date(),
      participants: [message.senderId],
    })
  }

  async assignAgentToSession(conversationId: string, tenantId: number, applicationId: string, lastAgentId: any, agentIgnore: any) {
    try {
      const availableAgentId = await lastValueFrom(
        this.agentAssignmentServiceClient.assignAgentToConversation({
          conversationId: conversationId,
          tenantId: tenantId,
          applicationId: applicationId,
          type: ConversationType.CHAT,
          lastAgentId: lastAgentId,
          agentIgnore: agentIgnore
        }))
      return availableAgentId
    } catch (error) {
      return error
    }
  };

  async requestSendMessageToZaloConnector(command: SendMessageCommand) {
    return lastValueFrom(this.zaloConnectorService.sendMessageToZalo(command))
  }

  async requestSendMessageToWSConnector(command: SendMessageCommand) {
    return lastValueFrom(this.whatSappConnectorService.sendMessageToWhatSapp(command))
  }

  async requestSendMessageToFacebookConnector(command: SendMessageCommand) {
    return lastValueFrom(this.facebookConnectorService.sendMessageToFacebook(command))
  }

  async requestSendMessageToViberConnector(command: SendMessageCommand) {
    return lastValueFrom(this.viberConnectorService.sendMessageToViber(command))
  }

  async requestSendMessageToTelegramConnector(command: SendMessageCommand) {
    return lastValueFrom(this.telegramConnectorService.sendMessageToTelegram(command))
  }

}
