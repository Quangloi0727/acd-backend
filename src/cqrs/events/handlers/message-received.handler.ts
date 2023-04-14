import {
  IEventHandler,
  EventsHandler,
  CommandBus,
  QueryBus,
} from '@nestjs/cqrs';
import { MessageReceivedEvent } from '../message-received.event';
import { LoggingService } from '../../../providers/logging';
import { ChatSessionManagerService } from '../../../chat-session-manager';
import { ChatSessionRegistryService } from '../../../chat-session-registry';
import {
  ChannelType,
  NotifyEventType,
  ParticipantType,
} from '../../../common/enums';
import {
  NotifyNewMessageToAgentCommand,
  SaveMessageCommand,
  TenantByApplicationQuery,
} from '../../../cqrs';
import { Message, MessageDocument, TenantDocument } from '../../../schemas';

@EventsHandler(MessageReceivedEvent)
export class MessageReceivedEventHandler
  implements IEventHandler<MessageReceivedEvent>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly chatSessionManagerService: ChatSessionManagerService,
    private readonly chatSessionRegistryService: ChatSessionRegistryService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  async handle(event: MessageReceivedEvent) {
    await this.loggingService.debug(
      MessageReceivedEventHandler,
      `Received a message: ${JSON.stringify(event)}`,
    );
    if (!event.message) {
      return;
    }

    const tenant = await this.queryBus.execute<
      TenantByApplicationQuery,
      TenantDocument
    >(new TenantByApplicationQuery(event.message.applicationId));
    if (!tenant) {
      return;
    }

    const message = Message.fromDto(event.message);
    message.messageOrder = message.receivedUnixEpoch;
    message.cloudTenantId = tenant.cloudTenantId;
    message.tenantId = tenant._id;
    message.startedBy = ParticipantType.CUSTOMER;
    message.senderName =
      message.channel === ChannelType.ZL_MESSAGE
        ? 'Liên hệ chưa follow OA'
        : 'Liên hệ mới';

    let conversationDocument =
      await this.chatSessionRegistryService.getConversation(
        message.applicationId,
        message.senderId,
      );

    if (!conversationDocument) {
      const conversation =
        await this.chatSessionManagerService.createConversation(message);
      conversationDocument =
        await this.chatSessionRegistryService.saveConversation(conversation);
    }

    await this.chatSessionManagerService.assignAgentToSession(
      conversationDocument._id,
      conversationDocument.cloudTenantId,
    );

    //save message
    message.conversationId = conversationDocument.id;
    conversationDocument.conversationId = conversationDocument.id;
    message.conversation = conversationDocument;
    const messageDocument = await this.commandBus.execute<
      SaveMessageCommand,
      MessageDocument
    >(new SaveMessageCommand(message));
    message.messageId = messageDocument._id;
    const rooms = [
      `${message.cloudTenantId}_${message.applicationId}`,
      `${message.cloudTenantId}_${message.applicationId}_supervisor`,
    ];
    // notify to agent
    await this.commandBus.execute(
      new NotifyNewMessageToAgentCommand(
        ParticipantType.AGENT,
        NotifyEventType.NEW_MESSAGE,
        rooms.join(','),
        {
          message: message,
        },
      ),
    );
  }
}
