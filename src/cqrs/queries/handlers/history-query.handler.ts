import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ChatHistoryQuery } from '../history.query';
import { Message, MessageDocument } from '../../../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@QueryHandler(ChatHistoryQuery)
export class ChatHistoryQueryHandler
  implements IQueryHandler<ChatHistoryQuery, MessageDocument[]>
{
  constructor(
    @InjectModel(Message.name)
    private readonly model: Model<MessageDocument>,
  ) {}

  async execute(query: ChatHistoryQuery): Promise<MessageDocument[]> {
    return await this.model
      .find({
        conversationId: query.conversationId,
      })
      .exec();
  }
}
