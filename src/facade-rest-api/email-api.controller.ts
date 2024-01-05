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
import { PickEmailDto } from './dtos/pick-email.dto';
import { CloseEmailDto } from './dtos/close-email.dto';
import { AgentPickConversationCommand } from '../cqrs/commands/agent-pick-conversation.command';
import { CloseEmailConversationCommand } from '../cqrs/commands/close-email-conversation.command';
import { ReopenEmailDto } from './dtos/creopen-email.dto';
import { ReopenEmailConversationCommand } from '../cqrs/commands/reopen-email-conversation.command';
import { EmailCountRequest } from './dtos/email-count-request'
import { GetEmailConversationRequest } from './dtos/email-get-conversations-request'

@Controller('email')
export class EmailManagerApiController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/stats')
  async getCountEmailByAgentId(@Body() request: EmailCountRequest) {
    return this.commandBus.execute(
      new CountEmailConversationCommand(
        request.tenantId,
        request.assignedAgentIds,
        request.applicationIds,
        request.replyStatus,
      ),
    );
  }

  @Post('/list')
  async getConversations(
    @Body() request: GetEmailConversationRequest
  ) {
    const [result, total] = await this.commandBus.execute(
      new GetEmailConversationsCommand(
        request.tenantId,
        request.assignedAgentIds,
        request.applicationIds,
        request.skip,
        request.take,
        request.state,
        request.replyStatus,    
        request.onlyUnread,
      ),
    );

    return {
      data: result,
      total: total,
    };
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

  @Post('/pick')
  async pickEmail(@Body() request: PickEmailDto) {
    return await this.commandBus.execute(
      new AgentPickConversationCommand(request),
    );
  }

  @Post('/close')
  async closeEmail(@Body() request: CloseEmailDto) {
    return await this.commandBus.execute(
      new CloseEmailConversationCommand(request),
    );
  }

  @Post('/reopen')
  async reopenEmail(@Body() request: ReopenEmailDto) {
    return await this.commandBus.execute(
      new ReopenEmailConversationCommand(request),
    );
  }
}
