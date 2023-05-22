import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SendMessageCommand } from '../send-message.command'
import { ChatSessionRegistryService } from '../../../chat-session-registry'
import { BadRequestException } from '@nestjs/common/exceptions'
import { ChatSessionManagerService } from '../../../chat-session-manager/chat-session-manager.service'
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command'
import { NotifyEventType, ParticipantType, ChannelType } from '../../../common/enums'

interface IResponse {
  statusCode: number,
  success: boolean,
  data: any
}

@CommandHandler(SendMessageCommand)
export class SendMessageCommandHandler
  implements ICommandHandler<SendMessageCommand, IResponse>
{
  constructor(
    private readonly chatSessionRegistryService: ChatSessionRegistryService,
    private readonly chatSessionManagerService: ChatSessionManagerService,
    private readonly commandBus: CommandBus
  ) { }

  async execute(command: SendMessageCommand): Promise<IResponse> {
    const { conversationId, channel } = command.message
    const checkChatSession = await this.chatSessionRegistryService.checkChatSessionByConversationId(conversationId)
    if (!checkChatSession) throw new BadRequestException("Not found chat session !")
    let response: any
    if (channel == ChannelType.ZL_MESSAGE) {
      response = await this.chatSessionManagerService.requestSendMessageToZaloConnector(command)
    } else {
      response = await this.chatSessionManagerService.requestSendMessageToFacebookConnector(command)
    }
    const messageCreated = await this.chatSessionRegistryService.saveMessage(response)
    const rooms = [`${response.cloudAgentId}_${response.cloudTenantId}_${messageCreated.applicationId}`]
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
        "messageType": response.messageType,
        "messageStatus": "SENT",
        "channel": channel,
        "receivedTime": new Date(),
        "conversationId": conversationId,
        "attachment": messageCreated.attachment,
      }
    }
  }

}