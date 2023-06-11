import { ICommand } from '@nestjs/cqrs'
import { CountConversationOpenDto } from '../../facade-rest-api/dtos/count-conversation-open.dto'
export class CountConversationOpenCommand implements ICommand {
    constructor(public body: CountConversationOpenDto) { }
}
