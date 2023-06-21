import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SendEmailCommand } from '../cqrs';

@Controller('email')
export class EmailManagerApiController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/detail/:id')
  async getConversationHistories(@Param('id') id: string) {
    return [];
  }

  @Post('/send')
  async sendEmail() {
    return await this.commandBus.execute(new SendEmailCommand());
  }

  @Put('/setSpam')
  async setSpam() {
    return true;
  }

  @Post('/assign')
  async assignEmail() {
    return true;
  }
}
