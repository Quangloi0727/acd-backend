import { Body, Controller, Post } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { CountByChannelsAndStatesCommand, FindByChannelsAndStatesCommand, FindBySenderCommand } from "../cqrs"
import { FindByChannelsAndStatesDto } from "./dtos/findByChannelsAndStates.dto"
import { FindBySenderDto } from "./dtos/findBySender.dto"
import { CountByChannelsAndStatesDto } from "./dtos/countByChannelsAndStates.dto"

@Controller('')
export class ChatSessionManagerApiController {
    constructor(
        private commandBus: CommandBus
    ) { }

    @Post('customer/find-by-channels-and-states')
    async findByChannelsAndStates(@Body() request: FindByChannelsAndStatesDto) {
        return await this.commandBus.execute(new FindByChannelsAndStatesCommand(request))
    }

    @Post('message/find-by-sender')
    async findBySender(@Body() request: FindBySenderDto) {
        return await this.commandBus.execute(new FindBySenderCommand(request))
    }
}