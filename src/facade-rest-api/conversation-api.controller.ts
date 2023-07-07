import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import {
  AllParticipantQuery,
  ChatHistoryQuery,
  SendMessageCommand,
  TenantByApplicationQuery,
  PickConversationCommand,
  CloseConversationCommand,
  CountConversationOpenCommand,
  ReopenConversationCommand,
  UnassignConversationCommand,
  TransferConversationCommand,
  JoinConversationCommand,
  LeaveConversationCommand,
  GetConversationByIdQuery
} from '../cqrs';
import {
  SendMessageDto,
  PickConversationDto,
  CloseConversationDto,
  CountConversationOpenDto,
  ReopenConversationDto,
  UnassignConversationDto,
  TransferConversationDto,
  JoinConversationDto,
  LeaveConversationDto,
} from './dtos';

@Controller('conversation')
export class ConversationManagerApiController {
  constructor(private queryBus: QueryBus, private commandBus: CommandBus) {}
  @Get('/histories/:id')
  async getConversationHistories(@Param('id') id: string) {
    return await this.queryBus.execute(new ChatHistoryQuery(id));
  }

  @Get('/detail/:id')
  async getDetailConversation(@Param('id') id: string) {
    return await this.queryBus.execute(new GetConversationByIdQuery(id));
  }

  @Post('/send')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('attachments'))
  async sendMessage(
    @UploadedFile() attachments: Express.Multer.File,
    @Body() request: SendMessageDto,
  ) {
    return await this.commandBus.execute(
      new SendMessageCommand(request, attachments),
    );
  }

  @Get('/participants')
  async getAllParticipants() {
    return await this.queryBus.execute(new AllParticipantQuery());
  }

  @Post('/pick')
  async pickConversation(@Body() request: PickConversationDto) {
    return await this.commandBus.execute(new PickConversationCommand(request));
  }

  @Post('/close')
  async closeConversation(@Body() request: CloseConversationDto) {
    return await this.commandBus.execute(new CloseConversationCommand(request));
  }

  @Post('/reopen')
  async reopenConversation(@Body() request: ReopenConversationDto) {
    return await this.commandBus.execute(
      new ReopenConversationCommand(request),
    );
  }

  @Post('/count-open-conversation')
  async countConversationOpen(@Body() request: CountConversationOpenDto) {
    return await this.commandBus.execute(
      new CountConversationOpenCommand(request),
    );
  }

  @Get('/tenants')
  async getAllTenants() {
    return await this.queryBus.execute(
      new TenantByApplicationQuery('806068369165782318'),
    );
  }

  @Post('/unassign')
  async unassignConversation(@Body() request: UnassignConversationDto) {
    return await this.commandBus.execute(
      new UnassignConversationCommand(request),
    );
  }

  @Post('/transfer')
  async transferConversation(@Body() request: TransferConversationDto) {
    return await this.commandBus.execute(
      new TransferConversationCommand(request),
    );
  }

  @Post('/join')
  async joinConversation(@Body() request: JoinConversationDto) {
    return await this.commandBus.execute(new JoinConversationCommand(request));
  }

  @Post('/leave')
  async leaveConversation(@Body() request: LeaveConversationDto) {
    return await this.commandBus.execute(new LeaveConversationCommand(request));
  }
}
