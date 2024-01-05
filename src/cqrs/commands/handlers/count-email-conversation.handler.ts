import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { CountEmailConversationCommand } from '../count-email-conversation.command';
import { LoggingService } from '../../../providers/logging';

@CommandHandler(CountEmailConversationCommand)
export class CountEmailConversationCommandHandler
  implements ICommandHandler<CountEmailConversationCommand, any>
{
  constructor(
    private readonly loggingService: LoggingService,
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: CountEmailConversationCommand): Promise<any> {
    await this.loggingService.debug(
      CountEmailConversationCommandHandler,
      `Request: ${JSON.stringify(command)}`,
    );
    let applicationQuery = {};
    if (command.applicationIds && command.applicationIds.length) {
      applicationQuery = {
        $regexMatch: {
          input: "$ToEmail",
          regex : new RegExp(command.applicationIds.join("|"), "i")
        },
      };
    }
    let replyQuery = {};
    if (command.replyStatus && command.replyStatus.length) {
      const status = command.replyStatus;
      if (status.includes('RESPONSED') && !status.includes('NORESPONSED')) {
        replyQuery = {
          $ifNull: ['$RelatedEmailId', false],
        };
      } else if (
        !status.includes('RESPONSED') &&
        status.includes('NORESPONSED')
      ) {
        replyQuery = {
          $in: [{ $type: '$RelatedEmailId' }, ['null', 'missing', 'undefined']],
        };
      }
    }
    const results = await this.model.aggregate([
      {
        $group: {
          _id: null,
          pendingEmail: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$TenantId', command.tenantId] },
                    {
                      $in: [
                        { $type: '$AgentId' },
                        ['null', 'missing', 'undefined'],
                      ],
                    },
                    applicationQuery,
                    replyQuery,
                    { $ne: ['$IsClosed', true] },
                    { $eq: ['$IsDeleted', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          assignEmail: {
            $sum: {
              $cond: [
                {
                  $and: [
                    applicationQuery,
                    replyQuery,
                    { $in: ['$AgentId', command.assignedAgentIds || []]},
                    { $eq: ['$TenantId', command.tenantId] },
                    { $ne: ['$IsClosed', true] },
                    { $eq: ['$IsDeleted', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          closedEmail: {
            $sum: {
              $cond: [
                {
                  $and: [
                    applicationQuery,
                    replyQuery,
                    { $eq: ['$TenantId', command.tenantId] },
                    { $eq: ['$IsClosed', true] },
                    { $eq: ['$IsDeleted', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    await this.loggingService.debug(
      CountEmailConversationCommandHandler,
      `Result: ${JSON.stringify(results)}`,
    );
    if (results) {
      const result = results[0];
      delete result['_id'];
      return result;
    }
    return {
      openEmail: 0,
      assignEmail: 0,
      closedEmail: 0,
    };
  }
}
