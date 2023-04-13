import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ChatHistoryQuery } from '../queries/history.query';
import { ChatSessionManagerService } from '../../chat-session-manager';
import { MessageDocument } from '../../schemas/message.schema';

@QueryHandler(ChatHistoryQuery)
export class ChatHistoryQueryHandler
  implements IQueryHandler<ChatHistoryQuery, MessageDocument[]>
{
  constructor(private chatSessionManagerService: ChatSessionManagerService) {}

  async execute(query: ChatHistoryQuery): Promise<MessageDocument[]> {
    return await this.chatSessionManagerService.getAllMessageByConversationId(
      query.conversationId,
      1,
    );
  }
}
