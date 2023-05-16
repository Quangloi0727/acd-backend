import { ICommand } from '@nestjs/cqrs'
import { CloseConversationDto } from '../../facade-rest-api/dtos/close-conversation.dto'
export class CloseConversationCommand implements ICommand {
    constructor(public body: CloseConversationDto) { }
}