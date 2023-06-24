import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JoinConversationCommand } from '../join-conversation.command';
import { LoggingService } from '../../../providers/logging';
import { KAFKA_TOPIC_MONITOR, NotifyEventType, ParticipantType } from '../../../common/enums';
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command';
import { ChatSessionSupervisingService } from '../../../chat-session-supervising';
import { Inject } from '@nestjs/common'
import { KafkaClientService, KafkaService } from 'src/providers/kafka'

@CommandHandler(JoinConversationCommand)
export class JoinConversationCommandHandler
  implements ICommandHandler<JoinConversationCommand, any>
{
  constructor(
    private readonly chatSessionSupervisingService: ChatSessionSupervisingService,
    private readonly loggingService: LoggingService,
    private readonly commandBus: CommandBus,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
  ) {}

  async execute(command: JoinConversationCommand): Promise<any> {
    await this.loggingService.debug(
      JoinConversationCommandHandler,
      `JoinConversationCommandHandler request: ${JSON.stringify(
        command.request,
      )}`,
    );
    const conversation =
      await this.chatSessionSupervisingService.joinConversation(
        command.request.conversationId,
        command.request.cloudAgentId,
      );
      
    const rooms = []
    conversation.participants.forEach((p) =>
      rooms.push(
        `${p}_${conversation.cloudTenantId}_${conversation.applicationId}`,
      ),
    );

    const data: any = { ...conversation };
    data.event = NotifyEventType.JOIN_CONVERSATION;
    data.room = rooms.join(',');
    data.conversationId = command.request.conversationId;
    data.pickedBy = conversation.agentPicked;

    // notify to agent
    await this.commandBus.execute(
      new NotifyNewMessageToAgentCommand(
        ParticipantType.AGENT,
        NotifyEventType.JOIN_CONVERSATION,
        rooms.join(','),
        data,
      ),
    );

    // send kafka event join conversation
    await this.kafkaService.send(data, KAFKA_TOPIC_MONITOR.CONVERSATION_JOIN)

    return {
      statusCode: 200,
      success: true,
    };
    
  }
}
