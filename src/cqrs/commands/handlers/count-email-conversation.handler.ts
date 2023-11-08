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
    const results = await this.model.aggregate([
      {
        $group: {
          _id: null,
          openEmail: {
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
                    { $ne: ['$IsClosed', true] },
                    { $ne: ['$SpamMarked', true] },
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
                    {
                      $in: [
                        '$AgentId',
                        command.agentIds.split(',').map((i) => Number(i)),
                      ],
                    },
                    { $eq: ['$TenantId', command.tenantId] },
                    { $ne: ['$IsClosed', true] },
                    { $ne: ['$SpamMarked', true] },
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
                    {
                      $in: [
                        '$AgentId',
                        command.agentIds.split(',').map((i) => Number(i)),
                      ],
                    },
                    { $eq: ['$TenantId', command.tenantId] },
                    { $eq: ['$IsClosed', true] },
                    { $ne: ['$SpamMarked', true] },
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
