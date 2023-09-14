import { ICommand } from '@nestjs/cqrs';
export class GetChatConversationByIdCommand implements ICommand {
  constructor(public conversationId: string) {}
}
