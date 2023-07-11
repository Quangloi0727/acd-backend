import { ICommand } from '@nestjs/cqrs'
import { CountByChannelsAndStatesDto } from 'src/chat-session-manager/dtos/countByChannelsAndStates.dto'
export class CountByChannelsAndStatesCommand implements ICommand {
    constructor(public body: CountByChannelsAndStatesDto) { }
}