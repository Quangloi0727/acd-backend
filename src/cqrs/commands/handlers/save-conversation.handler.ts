import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaveConversationCommand } from '../save-conversation.command';
import { Conversation, ConversationDocument } from '../../../schemas';

@CommandHandler(SaveConversationCommand)
export class SaveConversationCommandHandler
  implements ICommandHandler<SaveConversationCommand, ConversationDocument>
{
  constructor(
    @InjectModel(Conversation.name)
    private readonly model: Model<ConversationDocument>,
  ) {}

  async execute(
    command: SaveConversationCommand,
  ): Promise<ConversationDocument> {
    return new this.model({ ...command.conversation }).save();
  }
}
