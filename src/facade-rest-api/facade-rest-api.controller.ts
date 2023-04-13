import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ChatHistoryQuery } from './queries/history.query';
import { SendMessageCommand } from './queries/send-message.command';

@Controller('conversation')
export class FacadeRestApiController {
  constructor(private queryBus: QueryBus, private commandBus: CommandBus) {}
  @Get('/histories/:id')
  async getConversationHistories(@Param('id') id: string) {
    return await this.queryBus.execute(new ChatHistoryQuery(id));
  }

  @Post('/send')
  async sendMessage(@Body() request: string) {
    return await this.commandBus.execute(new SendMessageCommand());
  }
}
