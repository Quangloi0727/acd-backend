import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LeaveConversationCommand } from '../leave-conversation.command';
import { LoggingService } from '../../../providers/logging';
import { NotifyEventType, ParticipantType } from '../../../common/enums';
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command';
import { ChatSessionSupervisingService } from '../../../chat-session-supervising';

@CommandHandler(LeaveConversationCommand)
export class LeaveConversationCommandHandler
  implements ICommandHandler<LeaveConversationCommand, any>
{
  constructor(
    private readonly chatSessionSupervisingService: ChatSessionSupervisingService,
    private readonly loggingService: LoggingService,
    private readonly commandBus: CommandBus,
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
    const rooms = [
      `${command.request.currentAgentId}_${conversation.cloudTenantId}_${conversation.applicationId}`,
    ];
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
        data,
      ),
    );
    return {
      statusCode: 200,
      success: true,
    };
  }
}
