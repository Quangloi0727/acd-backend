import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { ObjectId } from 'mongodb';
import { MarkEmailAsSpamCommand } from '../mark-email-as-spam.command';

@CommandHandler(MarkEmailAsSpamCommand)
export class MarkEmailAsSpamCommandHandler
  implements ICommandHandler<MarkEmailAsSpamCommand, any>
{
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: MarkEmailAsSpamCommand): Promise<any> {
    return await this.model.updateOne(
      {
        _id: new ObjectId(command.request.conversationId),
      },
      {
        $set: {
          SpamMarked: command.isSpam,
        },
      },
    );
  }
}
