import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from '../../../schemas';
import { SaveEmailCommand } from '../save-email.command';

@CommandHandler(SaveEmailCommand)
export class SaveEmailCommandHandler
  implements ICommandHandler<SaveEmailCommand, EmailDocument>
{
  constructor(
    @InjectModel(Email.name)
    private readonly model: Model<EmailDocument>,
  ) {}

  async execute(command: SaveEmailCommand): Promise<EmailDocument> {
    return new this.model({ ...command.email }).save();
  }
}
