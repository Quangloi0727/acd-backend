import { ICommand } from '@nestjs/cqrs'
import { FindBySenderDto } from 'src/chat-session-manager/dtos/findBySender.dto'
export class FindBySenderCommand implements ICommand {
    constructor(public body: FindBySenderDto) { }
}