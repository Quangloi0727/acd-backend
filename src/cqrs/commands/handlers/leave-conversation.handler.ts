import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LeaveConversationCommand } from '../leave-conversation.command';
import { LoggingService } from '../../../providers/logging';
import { KAFKA_TOPIC_MONITOR, NotifyEventType, ParticipantType } from '../../../common/enums';
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command';
import { ChatSessionSupervisingService } from '../../../chat-session-supervising';
import { KafkaClientService, KafkaService } from 'src/providers/kafka'
import { Inject } from '@nestjs/common'

@CommandHandler(LeaveConversationCommand)
export class LeaveConversationCommandHandler
  implements ICommandHandler<LeaveConversationCommand, any>
{
  constructor(
    private readonly chatSessionSupervisingService: ChatSessionSupervisingService,
    private readonly loggingService: LoggingService,
    private readonly commandBus: CommandBus,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService
  ) {}

  async execute(command: LeaveConversationCommand): Promise<any> {
    await this.loggingService.debug(
      LeaveConversationCommandHandler,
      `LeaveConversationCommandHandler request: ${JSON.stringify(
        command.request,
      )}`,
    );
    const conversation =
      await this.chatSessionSupervisingService.leaveConversation(
        command.request.conversationId,
        command.request.currentAgentId,
      );

    const rooms = []
    conversation.participants.forEach((p) =>
      rooms.push(
        `${p}_${conversation.cloudTenantId}_${conversation.applicationId}`,
      ),
    );
    
    const data: any = { ...conversation };
    data.event = NotifyEventType.LEAVE_CONVERSATION;
    data.room = rooms.join(',');
    data.conversationId = command.request.conversationId;
    data.pickedBy = conversation.agentPicked;

    // notify to agent
    await this.commandBus.execute(
      new NotifyNewMessageToAgentCommand(
        ParticipantType.AGENT,
        NotifyEventType.LEAVE_CONVERSATION,
        rooms.join(','),
        data
      )
    );

    // send kafka event leave conversation
    await this.kafkaService.send(data, KAFKA_TOPIC_MONITOR.CONVERSATION_LEAVE)

    return {
      statusCode: 200,
      success: true,
    };
  }
}
