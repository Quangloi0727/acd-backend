import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
  Message,
  MessageDocument,
} from '../../../schemas';
import { LoggingService } from '../../../providers/logging';
import _ from 'underscore';
import { GetChatConversationByIdCommand } from '../get-chat-conversation-by-id.command';

@CommandHandler(GetChatConversationByIdCommand)
export class GetChatConversationByIdCommandHandler
  implements ICommandHandler<GetChatConversationByIdCommand>
{
  constructor(
    @InjectModel(Conversation.name)
    private readonly model: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly modelMessage: Model<MessageDocument>,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(data: GetChatConversationByIdCommand) {
    await this.loggingService.debug(
      GetChatConversationByIdCommandHandler,
      `Data receive is: ${JSON.stringify(data)}`,
    );

    const listData = await this.model
      .find({ _id: data.conversationId })
      .populate({ path: 'messages' })
      .lean();

    const finalData = listData.map((el: any) => {
      el.conversationId = el._id;
      return el;
    });

    return {
      statusCode: 200,
      success: true,
      data: finalData,
    };
  }
}
