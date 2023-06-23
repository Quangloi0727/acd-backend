import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { GetEmailConversationsCommand } from '../get-email-conversations.command';

@CommandHandler(GetEmailConversationsCommand)
export class GetEmailConversationsCommandHandler
  implements
    ICommandHandler<GetEmailConversationsCommand, EmailConversationDocument[]>
{
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(
    command: GetEmailConversationsCommand,
  ): Promise<EmailConversationDocument[]> {
    const matchQueries: FilterQuery<EmailConversationDocument>[] = [
      { AgentId: { $in: command.agentId.split(',') } },
      { IsDeleted: false },
    ];
    if (command.query) {
      matchQueries.push({ Subject: { $regex: command.query, $options: 'i' } });
    }
    if (command.onlySpam == true) {
      matchQueries.push({ SpamMarked: true });
    } else {
      matchQueries.push({ SpamMarked: false });
    }
    if (command.onlyUnread == true) {
      matchQueries.push({ Readed: false });
    }
    return await this.model
      .find({
        $and: matchQueries,
      })
      .limit(command.row + 10);
  }
}
