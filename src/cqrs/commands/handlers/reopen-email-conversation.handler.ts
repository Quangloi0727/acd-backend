import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggingService } from '../../../providers/logging';
import { InjectModel } from '@nestjs/mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { Model } from 'mongoose';
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command';
import { FireKafkaEventCommand } from '../fire-kafka-event.command';
import {
  KAFKA_TOPIC_MONITOR,
  NotifyEventType,
  ParticipantType,
} from '../../../common/enums';
import { ReopenEmailConversationCommand } from '../reopen-email-conversation.command';

@CommandHandler(ReopenEmailConversationCommand)
export class ReopenEmailConversationCommandHandler
  implements ICommandHandler<ReopenEmailConversationCommand>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly commandBus: CommandBus,
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: ReopenEmailConversationCommand): Promise<any> {
    await this.loggingService.debug(
      ReopenEmailConversationCommandHandler,
      `ReopenEmailConversationCommandHandler request: ${JSON.stringify(
        command,
      )}`,
    );

    const conversations = await this.model.find({
      _id: { $in: command.body.emailIds },
      IsClosed: true,
      IsDeleted: false,
    });
    if (!conversations.length) {
      return {
        message: 'Email Ids invalid!',
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
        $set: {
          IsClosed: false,
          ClosedByAgent: null,
          ClosedDate: null,
          AgentId: command.body.agentId,
          AssignedDate: new Date(),
        },
      },
    );

    const data = conversations;
    const rooms = [];
    await this.commandBus.execute(
      new NotifyNewMessageToAgentCommand(
        ParticipantType.AGENT,
        NotifyEventType.EMAIL_CLOSED,
        rooms.join(','),
        data,
      ),
    );
    await this.commandBus.execute(
      new FireKafkaEventCommand(KAFKA_TOPIC_MONITOR.EMAIL_REOPENED, data),
    );
    return {
      message: 'success',
      status: true,
    };
  }
}
