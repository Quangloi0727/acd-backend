import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { MarkEmailAsUnreadCommand } from '../mark-email-as-unread.command';
import { ObjectId } from 'mongodb';

@CommandHandler(MarkEmailAsUnreadCommand)
export class MarkEmailAsUnreadCommandHandler
  implements ICommandHandler<MarkEmailAsUnreadCommand, any>
{
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: MarkEmailAsUnreadCommand): Promise<any> {
    const ids = command.request.conversationIds.map((i) => new ObjectId(i));
    return await this.model.updateMany(
      {
        _id: {
          $in: ids,
        },
      },
      {
        $set: {
          Readed: false,
        },
        $unset: { Reader: '', ReadedTime: '' },
      },
    );
  }
}
