import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  CountByChannelsAndStatesCommand,
  FindByChannelsAndStatesCommand,
  FindBySenderCommand,
  GetChatConversationByIdCommand,
} from '../cqrs';
import { FindByChannelsAndStatesDto } from '../chat-session-manager/dtos/findByChannelsAndStates.dto';
import { FindBySenderDto } from '../chat-session-manager/dtos/findBySender.dto';
import { CountByChannelsAndStatesDto } from 'src/chat-session-manager/dtos/countByChannelsAndStates.dto';
import { FindByConversationDto } from 'src/chat-session-manager/dtos/findByConversation.dto';

@Controller('')
export class MessageManagerApiController {
  constructor(private commandBus: CommandBus) {}

  @Post('customer/find-by-channels-and-states')
  async findByChannelsAndStates(@Body() request: FindByChannelsAndStatesDto) {
    return await this.commandBus.execute(
      new FindByChannelsAndStatesCommand(request),
    );
  }

  @Post('customer/count-by-channels-and-states')
  async countByChannelsAndStates(@Body() request: CountByChannelsAndStatesDto) {
    return await this.commandBus.execute(
      new CountByChannelsAndStatesCommand(request),
    );
  }

  @Post('message/find-by-sender')
  async findBySender(@Body() request: FindBySenderDto) {
    return await this.commandBus.execute(new FindBySenderCommand(request));
  }

  @Post('message/find-by-conversation')
  async findByConversation(@Body() request: FindByConversationDto) {
    return await this.commandBus.execute(
      new GetChatConversationByIdCommand(request.conversationId),
    );
  }
}
