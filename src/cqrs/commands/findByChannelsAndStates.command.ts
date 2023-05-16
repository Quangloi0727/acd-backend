import { ICommand } from '@nestjs/cqrs'
import { FindByChannelsAndStatesDto } from '../../chat-session-manager/dtos/findByChannelsAndStates.dto'
export class FindByChannelsAndStatesCommand implements ICommand {
    constructor(public body: FindByChannelsAndStatesDto) { }
}