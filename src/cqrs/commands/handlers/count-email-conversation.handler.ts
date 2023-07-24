import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { CountEmailConversationCommand } from '../count-email-conversation.command';

@CommandHandler(CountEmailConversationCommand)
export class CountEmailConversationCommandHandler
  implements ICommandHandler<CountEmailConversationCommand, any>
{
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: CountEmailConversationCommand): Promise<any> {
    const results = await this.model.aggregate([
      {
        $group: {
          _id: null,
          unreadEmail: {
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
                    { $eq: ['$TenantId', false] },
                    { $eq: ['$Readed', false] },
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
                    { $eq: ['$TenantId', false] },
                    { $ne: ['$SpamMarked', true] },
                    { $eq: ['$IsDeleted', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          spamEmail: {
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
                    { $eq: ['$TenantId', false] },
                    { $eq: ['$SpamMarked', true] },
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
    if (results) {
      const result = results[0];
      delete result['_id'];
      return result;
    }
    return {
      unreadEmail: 0,
      assignEmail: 0,
      spamEmail: 0,
    };
  }
}
