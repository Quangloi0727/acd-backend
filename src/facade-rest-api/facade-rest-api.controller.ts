import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import {
  AllParticipantQuery,
  ChatHistoryQuery,
  SendMessageCommand,
  TenantByApplicationQuery,
} from '../cqrs';

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

  @Get('/participants')
  async getAllParticipants() {
    return await this.queryBus.execute(new AllParticipantQuery());
  }
  @Get('/tenants')
  async getAllTenants() {
    return await this.queryBus.execute(
      new TenantByApplicationQuery('806068369165782318'),
    );
  }
}
