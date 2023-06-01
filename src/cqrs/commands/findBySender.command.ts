import { ICommand } from '@nestjs/cqrs'
import { FindBySenderDto } from '../../chat-session-manager/dtos/findBySender.dto'
export class FindBySenderCommand implements ICommand {
    constructor(public body: FindBySenderDto) { }
}