import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SendMessageCommand } from '../send-message.command'
import { ChatSessionRegistryService } from '../../../chat-session-registry'
import { BadRequestException } from '@nestjs/common/exceptions'
import { ChatSessionManagerService } from '../../../chat-session-manager/chat-session-manager.service'
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command'
import { NotifyEventType, ParticipantType, ChannelType, MessageStatus, KAFKA_TOPIC_MONITOR } from '../../../common/enums'
import { Inject } from '@nestjs/common'
import { KafkaClientService, KafkaService } from '../../../providers/kafka'

interface IResponse {
  statusCode: number,
  success: boolean,
  data?: any,
  description?: string
}

@CommandHandler(SendMessageCommand)
export class SendMessageCommandHandler
  implements ICommandHandler<SendMessageCommand, IResponse>
{
  constructor(
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
    private readonly chatSessionRegistryService: ChatSessionRegistryService,
    private readonly chatSessionManagerService: ChatSessionManagerService,
    private readonly commandBus: CommandBus
  ) { }

  async execute(command: SendMessageCommand): Promise<IResponse> {
    try {
      const { conversationId, channel } = command.message
      const checkChatSession = await this.chatSessionRegistryService.checkChatSessionByConversationId(conversationId)
      if (!checkChatSession) throw new BadRequestException("Not found chat session !")
      let response: any
      if (channel == ChannelType.ZL_MESSAGE) {
        response = await this.chatSessionManagerService.requestSendMessageToZaloConnector(command)
      } else if (channel == ChannelType.WS_MESSAGE){
        response = await this.chatSessionManagerService.requestSendMessageToWSConnector(command)
      } else if (channel == ChannelType.VB_MESSAGE){
        response = await this.chatSessionManagerService.requestSendMessageToViberConnector(command)
      } else {
        response = await this.chatSessionManagerService.requestSendMessageToFacebookConnector(command)
      }
      const messageCreated = await this.chatSessionRegistryService.saveMessage(response)

      let rooms = []
      for (const item of checkChatSession.participants) {
        rooms.push(`${item}_${response.cloudTenantId}_${messageCreated.applicationId}`)
      }
      // send kafka event create new conversation
      await this.kafkaService.send(messageCreated, KAFKA_TOPIC_MONITOR.CONVERSATION_MESSAGE_SEND)

      //notify to agent
      await this.commandBus.execute(
        new NotifyNewMessageToAgentCommand(
          ParticipantType.AGENT,
          NotifyEventType.MESSAGE_TRANSFERED,
          rooms.join(','),
          {
            message: messageCreated,
          }
        )
      )
      return {
        statusCode: 200,
        success: true,
        data: {
          messageType: response.messageType,
          messageStatus: MessageStatus.SENT,
          channel: channel,
          receivedTime: new Date(),
          conversationId: conversationId,
          attachment: messageCreated.attachment,
        }
      }
    } catch (error) {
      return {
        statusCode: 500,
        success: false,
        description: error.message
      }
    }
  }

}