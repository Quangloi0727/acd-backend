import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from '../../../schemas';
import { GetEmailDetailCommand } from '../get-email-detail.command';
import { ObjectId } from 'mongodb';

@CommandHandler(GetEmailDetailCommand)
export class GetEmailDetailCommandHandler
  implements ICommandHandler<GetEmailDetailCommand, EmailDocument[]>
{
  constructor(
    @InjectModel(Email.name)
    private readonly model: Model<EmailDocument>,
  ) {}

  async execute(command: GetEmailDetailCommand): Promise<EmailDocument[]> {
    return await this.model
      .find({
        conversationId: new ObjectId(command.conversationId),
      })
      .sort({ ReceivedTime: 1 });
  }
}
