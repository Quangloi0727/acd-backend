import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferConversationCommand } from '../transfer-conversation.command';
import { LoggingService } from '../../../providers/logging';
import {
  KAFKA_TOPIC_MONITOR,
  NotifyEventType,
  ParticipantType,
} from '../../../common/enums';
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command';
import { ChatSessionSupervisingService } from '../../../chat-session-supervising';
import { Inject } from '@nestjs/common';
import { KafkaClientService, KafkaService } from '../../../providers/kafka';

@CommandHandler(TransferConversationCommand)
export class TransferConversationCommandHandler
  implements ICommandHandler<TransferConversationCommand, any>
{
  constructor(
    private readonly chatSessionSupervisingService: ChatSessionSupervisingService,
    private readonly loggingService: LoggingService,
    private readonly commandBus: CommandBus,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
  ) {}

  async execute(command: TransferConversationCommand): Promise<any> {
    await this.loggingService.debug(
      TransferConversationCommandHandler,
      `TransferConversationCommandHandler request: ${JSON.stringify(
        command.request,
      )}`,
    );
    const conversation =
      await this.chatSessionSupervisingService.transferConversation(
        command.request.conversationId,
        command.request.currentAgentId,
        command.request.newAgentId,
      );
    const rooms = [
      `${command.request.currentAgentId}_${conversation.cloudTenantId}_${conversation.applicationId}`,
      `${command.request.newAgentId}_${conversation.cloudTenantId}_${conversation.applicationId}`,
    ];
    const data: any = { ...conversation };
    data.event = NotifyEventType.TRANSFER_CONVERSATION;
    data.room = rooms.join(',');
    data.conversationId = command.request.conversationId;
    data.pickedBy = conversation.agentPicked;
    // notify to agent
    await this.commandBus.execute(
      new NotifyNewMessageToAgentCommand(
        ParticipantType.AGENT,
        NotifyEventType.TRANSFER_CONVERSATION,
        rooms.join(','),
        data,
      ),
    );

    // send kafka event transfer conversation
    await this.kafkaService.send(
      data,
      KAFKA_TOPIC_MONITOR.CONVERSATION_MESSAGE_TRANSFER,
    );
    return {
      statusCode: 200,
      success: true,
    };
  }
}
