import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { ObjectId } from 'mongodb';
import { MarkEmailAsReadCommand } from '../mark-email-as-read.command';

@CommandHandler(MarkEmailAsReadCommand)
export class MarkEmailAsReadCommandHandler
  implements ICommandHandler<MarkEmailAsReadCommand, any>
{
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: MarkEmailAsReadCommand): Promise<any> {
    return await this.model.updateOne(
      {
        _id: new ObjectId(command.request.conversationId),
      },
      {
        $set: {
          Readed: true,
          Reader: command.request.agentId,
          ReadedTime: new Date(),
        },
      },
    );
  }
}
