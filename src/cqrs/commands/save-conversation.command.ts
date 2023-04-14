import { ICommand } from '@nestjs/cqrs';
import { Conversation } from '../../schemas';

export class SaveConversationCommand implements ICommand {
  constructor(public conversation: Conversation) {}
}
