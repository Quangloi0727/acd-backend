import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { QueryBus, CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes } from '@nestjs/swagger'
import {
  AllParticipantQuery,
  ChatHistoryQuery,
  SendMessageCommand,
  TenantByApplicationQuery,
  PickConversationCommand,
  CloseConversationCommand,
  CountConversationOpenCommand,
  ReopenConversationCommand
} from '../cqrs'
import { SendMessageDto } from './dtos/send-message.dto'
import { PickConversationDto } from './dtos/pick-converstation.dto'
import { CloseConversationDto } from './dtos/close-conversation.dto'
import { CountConversationOpenDto } from './dtos/count-conversation-open.dto'
import { ReopenConversationDto } from './dtos/reopen-conversation.dto'
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
    return await this.queryBus.execute(new AllParticipantQuery())
  }

  @Post('/pick')
  async pickConversation(@Body() request: PickConversationDto) {
    return await this.commandBus.execute(new PickConversationCommand(request))
  }

  @Post('/close')
  async closeConversation(@Body() request: CloseConversationDto) {
    return await this.commandBus.execute(new CloseConversationCommand(request))
  }

  @Post('/reopen')
  async reopenConversation(@Body() request: ReopenConversationDto) {
    return await this.commandBus.execute(new ReopenConversationCommand(request))
  }

  @Post('/count-open-conversation')
  async countConversationOpen(@Body() request: CountConversationOpenDto) {
    return await this.commandBus.execute(new CountConversationOpenCommand(request))
  }

  @Get('/tenants')
  async getAllTenants() {
    return await this.queryBus.execute(
      new TenantByApplicationQuery('806068369165782318'),
    )
  }
}
