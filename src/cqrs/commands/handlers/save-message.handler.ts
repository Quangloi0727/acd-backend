import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaveMessageCommand } from '../save-message.command';
import { Message, MessageDocument } from '../../../schemas/message.schema';

@CommandHandler(SaveMessageCommand)
export class SaveMessageCommandHandler
  implements ICommandHandler<SaveMessageCommand, MessageDocument>
{
  constructor(
    @InjectModel(Message.name)
    private readonly model: Model<MessageDocument>,
  ) {}

  async execute(command: SaveMessageCommand): Promise<MessageDocument> {
    return new this.model({ ...command.message }).save();
  }
}
