import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { GetEmailConversationsCommand } from '../get-email-conversations.command';
import { LoggingService } from '../../../providers/logging';
import { ConversationState } from 'src/common/enums'

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
    await this.loggingService.debug(
      GetEmailConversationsCommandHandler,
      `Data receive is: ${JSON.stringify(command)}`,
    );
    const matchQueries: FilterQuery<EmailConversationDocument>[] = [
      { IsDeleted: false },
      { TenantId: command.tenantId },
    ];
    if (command.onlyUnread == true) {
      matchQueries.push({ Readed: false });
    }

    if (command.applicationIds && command.applicationIds.length > 0) {
      matchQueries.push({
        ToEmail: { $regex: new RegExp(command.applicationIds.join("|"), "i") },
      });
    }
    switch (command.state) {
      case ConversationState.OPEN:
        matchQueries.push({ AgentId: null, IsClosed: { $ne: true } });
        break;
      case ConversationState.INTERACTIVE:
        matchQueries.push({
          AgentId: { $in: command.assignedAgentIds },
          IsClosed: { $ne: true },
        });
        break;
      case ConversationState.CLOSE:
        matchQueries.push({
          AgentId: { $in: command.assignedAgentIds },
          IsClosed: true,
          SpamMarked: { $ne: true },
        });
        break;
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
