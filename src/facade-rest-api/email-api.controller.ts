import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  AssignAgentToConversationCommand,
  CountEmailConversationCommand,
  GetEmailConversationsCommand,
  GetEmailDetailCommand,
  MarkEmailAsReadCommand,
  MarkEmailAsSpamCommand,
  MarkEmailAsUnreadCommand,
  SendEmailCommand,
} from '../cqrs';
import { MarkAsReadDto, MarkAsSpamDto, MarkAsUnreadDto } from './dtos';
import { SendEmailDto } from './dtos/send-email.dto';
import { AssignEmailDto } from './dtos/assign-email.dto';

@Controller('email')
export class EmailManagerApiController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/stats')
  async getCountEmailByAgentId(@Query('userIds') ids: string) {
    return this.commandBus.execute(new CountEmailConversationCommand(ids));
  }

  @Get('/list')
  async getConversations(
    @Query('query') query: string,
    @Query('userIds') ids: string,
    @Query('onlySpam') onlySpam: string,
    @Query('onlyUnread') onlyUnread: string,
    @Query('row') row: number,
  ) {
    return this.commandBus.execute(
      new GetEmailConversationsCommand(
        query,
        ids,
        onlySpam == 'true' ? true : false,
        onlyUnread == 'true' ? true : false,
        Number(row ?? 0) ?? 10,
      ),
    );
  }

  @Get('/detail')
  async getEmailDetail(@Query('converstationId') conversationId: string) {
    return await this.commandBus.execute(
      new GetEmailDetailCommand(conversationId),
    );
  }

  @Put('/markAsRead')
  async markAsRead(@Body() request: MarkAsReadDto) {
    return await this.commandBus.execute(new MarkEmailAsReadCommand(request));
  }

  @Put('/markAsUnread')
  async markAsUnread(@Body() request: MarkAsUnreadDto) {
    return await this.commandBus.execute(new MarkEmailAsUnreadCommand(request));
  }

  @Put('/markAsSpam')
  async markAsSpam(@Body() request: MarkAsSpamDto) {
    return await this.commandBus.execute(
      new MarkEmailAsSpamCommand(request, true),
    );
  }

  @Put('/unmarkSpam')
  async unmarkSpam(@Body() request: MarkAsSpamDto) {
    return await this.commandBus.execute(
      new MarkEmailAsSpamCommand(request, false),
    );
  }

  @Post('/send')
  async sendEmail(@Body() request: SendEmailDto) {
    return await this.commandBus.execute<SendEmailCommand, string>(
      new SendEmailCommand(request),
    );
  }

  @Post('/assign')
  async assignEmail(@Body() request: AssignEmailDto) {
    return await this.commandBus.execute(
      new AssignAgentToConversationCommand(request.agentId, request.emailIds),
    );
  }
}
