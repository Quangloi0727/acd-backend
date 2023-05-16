import { ICommand } from '@nestjs/cqrs'
import { ReopenConversationDto } from '../../facade-rest-api/dtos/reopen-conversation.dto'
export class ReopenConversationCommand implements ICommand {
    constructor(public body: ReopenConversationDto) { }
}
