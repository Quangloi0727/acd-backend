import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { GetEmailConversationsCommand } from '../get-email-conversations.command';
import { LoggingService } from '../../../providers/logging';

@CommandHandler(GetEmailConversationsCommand)
export class GetEmailConversationsCommandHandler
  implements
    ICommandHandler<
      GetEmailConversationsCommand,
      [EmailConversationDocument[], number]
    >
{
  constructor(
    private readonly loggingService: LoggingService,
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(
    command: GetEmailConversationsCommand,
  ): Promise<[EmailConversationDocument[], number]> {
    // await this.loggingService.debug(
    //   GetEmailConversationsCommandHandler,
    //   `Data receive is: ${JSON.stringify(command)}`,
    // );
    const matchQueries: FilterQuery<EmailConversationDocument>[] = [
      { AgentId: { $in: command.agentId.split(',') } },
      { IsDeleted: false },
      { TenantId: command.tenantId },
      {
        ReceivedTime: {
          $gte: command.fromDate,
          $lte: command.toDate,
        },
      },
    ];
    if (command.query) {
      matchQueries.push({ Subject: { $regex: command.query, $options: 'i' } });
    }
    if (command.emails) {
      matchQueries.push({ ToEmail: { $in: command.emails.split(',') } });
    }
    if (command.onlySpam == true) {
      matchQueries.push({ SpamMarked: true });
    } else {
      matchQueries.push({ SpamMarked: false });
    }
    if (command.onlyUnread == true) {
      matchQueries.push({ Readed: false });
    }
    const result = await this.model
      .find({
        $and: matchQueries,
      })
      .sort({ ReceivedTime: -1 })
      .skip(command.skip)
      .limit(command.take);
    const total = await this.model.count({
      $and: matchQueries,
    });
    return [result, total];
  }
}
