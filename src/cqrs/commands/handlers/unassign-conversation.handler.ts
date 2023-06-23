import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnassignConversationCommand } from '../unassign-conversation.command';
import { LoggingService } from '../../../providers/logging';
import { NotifyEventType, ParticipantType } from '../../../common/enums';
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command';
import { ChatSessionSupervisingService } from '../../../chat-session-supervising';

@CommandHandler(UnassignConversationCommand)
export class UnassignConversationCommandHandler
  implements ICommandHandler<UnassignConversationCommand, any>
{
  constructor(
    private readonly chatSessionSupervisingService: ChatSessionSupervisingService,
    private readonly loggingService: LoggingService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: UnassignConversationCommand): Promise<any> {
    await this.loggingService.debug(
      UnassignConversationCommandHandler,
      `UnassignConversationCommandHandler request: ${JSON.stringify(
        command.request,
      )}`,
    );
    const conversation =
      await this.chatSessionSupervisingService.unassignConversation(
        command.request.conversationId,
        // command.request.currentAgentId,
      );
    const rooms = [];
    conversation.participants.forEach((p) =>
      rooms.push(
        `${p}_${conversation.cloudTenantId}_${conversation.applicationId}`,
      ),
    );
    const data: any = { ...conversation };
    data.event = NotifyEventType.UNASSIGN_CONVERSATION;
    data.room = rooms.join(',');
    data.conversationId = command.request.conversationId;
    data.pickedBy = conversation.agentPicked;
    // notify to agent
    await this.commandBus.execute(
      new NotifyNewMessageToAgentCommand(
        ParticipantType.AGENT,
        NotifyEventType.UNASSIGN_CONVERSATION,
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
