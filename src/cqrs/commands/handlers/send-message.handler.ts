import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SendMessageCommand } from '../send-message.command'
import { MessageType } from 'src/facade-rest-api/dtos/send-message.dto'
import { ChatSessionRegistryService } from 'src/chat-session-registry'
import { BadRequestException } from '@nestjs/common/exceptions'
import { ChatSessionManagerService } from 'src/chat-session-manager/chat-session-manager.service'

@CommandHandler(SendMessageCommand)
export class SendMessageCommandHandler
  implements ICommandHandler<SendMessageCommand, boolean>
{
  constructor(
    private readonly chatSessionRegistryService: ChatSessionRegistryService,
    private readonly chatSessionManagerService: ChatSessionManagerService
  ) { }

  async execute(command: SendMessageCommand): Promise<boolean> {
    const { conversationId } = command.message
    const checkChatSession = await this.chatSessionRegistryService.checkChatSessionByConversationId(conversationId)
    if (!checkChatSession) throw new BadRequestException("Not found chat session !")
    const response = await this.chatSessionManagerService.requestSendMessageToZaloConnector(command)
    await this.chatSessionRegistryService.saveMessage(response)
    return true
  }

}
