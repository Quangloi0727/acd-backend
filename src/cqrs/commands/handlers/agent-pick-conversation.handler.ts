import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggingService } from '../../../providers/logging';
import { InjectModel } from '@nestjs/mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { Model } from 'mongoose';
import { AgentPickConversationCommand } from '../agent-pick-conversation.command';
import { FireKafkaEventCommand } from '../fire-kafka-event.command';
import {
  KAFKA_TOPIC_MONITOR,
  NotifyEventType,
  ParticipantType,
} from '../../../common/enums';
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command';

@CommandHandler(AgentPickConversationCommand)
export class AgentPickConversationCommandHandler
  implements ICommandHandler<AgentPickConversationCommand>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly commandBus: CommandBus,
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: AgentPickConversationCommand) {
    await this.loggingService.debug(
      AgentPickConversationCommandHandler,
      `AgentPickConversationCommandHandler request: ${JSON.stringify(command)}`,
    );

    const conversations = await this.model.find({
      _id: { $in: command.body.emailIds },
      AgentId: null,
      IsClosed: { $ne: true },
      IsDeleted: false,
    });
    if (!conversations.length) {
      return {
        message: 'Email ids invalid!',
        status: false,
      };
    }

    await this.model.updateMany(
      {
        _id: {
          $in: conversations.map((i) => i._id),
        },
      },
      {
        $set: { AgentId: command.body.agentId, AssignedDate: new Date() },
      },
    );
    const rooms = [`email_${command.body.tenantId}`];
    conversations.forEach((conversation) => {
      rooms.push(`email_${conversation.TenantId}_${conversation.ToEmail}`);
    });
    await this.commandBus.execute(
      new NotifyNewMessageToAgentCommand(
        ParticipantType.AGENT,
        NotifyEventType.EMAIL_PICKED,
        rooms.join(','),
        conversations,
      ),
    );
    await this.commandBus.execute(
      new FireKafkaEventCommand(
        KAFKA_TOPIC_MONITOR.EMAIL_PICKED,
        conversations,
      ),
    );
    return {
      message: 'success',
      status: true,
    };
  }
}
