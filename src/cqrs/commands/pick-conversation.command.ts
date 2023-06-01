import { ICommand } from '@nestjs/cqrs'
import { PickConversationDto } from '../../facade-rest-api/dtos/pick-converstation.dto'
export class PickConversationCommand implements ICommand {
    constructor(public body: PickConversationDto) { }
}
