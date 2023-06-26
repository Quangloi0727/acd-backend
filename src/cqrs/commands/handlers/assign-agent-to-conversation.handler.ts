import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { AssignAgentToConversationCommand } from '../assign-agent-to-conversation.command';
import { ObjectId } from 'mongodb';

@CommandHandler(AssignAgentToConversationCommand)
export class AssignAgentToConversationCommandHandler
  implements ICommandHandler<AssignAgentToConversationCommand, any>
{
  constructor(
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: AssignAgentToConversationCommand): Promise<any> {
    console.log(command);
    return this.model.updateMany(
      {
        _id: {
          $in: command.conversationIds.map((i) => new ObjectId(i)),
        },
      },
      {
        $set: { AgentId: command.agentId, AssignedDate: new Date() },
      },
    );
  }
}
