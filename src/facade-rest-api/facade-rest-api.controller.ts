import { Body, Controller, Get, Param, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { QueryBus, CommandBus } from '@nestjs/cqrs'
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes } from '@nestjs/swagger'
import {
  AllParticipantQuery,
  ChatHistoryQuery,
  SendMessageCommand,
  TenantByApplicationQuery,
} from '../cqrs'
import { SendMessageDto } from './dtos/send-message.dto'

@Controller('conversation')
export class FacadeRestApiController {
  constructor(private queryBus: QueryBus, private commandBus: CommandBus) { }
  @Get('/histories/:id')
  async getConversationHistories(@Param('id') id: string) {
    return await this.queryBus.execute(new ChatHistoryQuery(id))
  }

  @Post('/send')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('attachments'))
  async sendMessage(@UploadedFile() attachments: Express.Multer.File , @Body() request: SendMessageDto) {
    return await this.commandBus.execute(new SendMessageCommand(request, attachments))
  }

  @Get('/participants')
  async getAllParticipants() {
    return await this.queryBus.execute(new AllParticipantQuery(undefined))
  }
  @Get('/tenants')
  async getAllTenants() {
    return await this.queryBus.execute(
      new TenantByApplicationQuery('806068369165782318'),
    )
  }
}
