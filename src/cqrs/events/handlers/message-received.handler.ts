import {
  IEventHandler,
  EventsHandler,
  CommandBus,
  QueryBus,
} from '@nestjs/cqrs'
import { MessageReceivedEvent } from '../message-received.event'
import { LoggingService } from '../../../providers/logging'
import { ChatSessionManagerService } from '../../../chat-session-manager'
import { ChatSessionRegistryService } from '../../../chat-session-registry'
import {
  ChannelType,
  ConversationState,
  MessageStatus,
  NotifyEventType,
  ParticipantType,
} from '../../../common/enums'
import {
  NotifyNewMessageToAgentCommand,
  SaveMessageCommand,
  TenantByApplicationQuery,
  AllParticipantQuery
} from '../../../cqrs'
import { Message, Tenant, Participant } from '../../../schemas'

@EventsHandler(MessageReceivedEvent)
export class MessageReceivedEventHandler
  implements IEventHandler<MessageReceivedEvent>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly chatSessionManagerService: ChatSessionManagerService,
    private readonly chatSessionRegistryService: ChatSessionRegistryService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) { }
  async handle(event: MessageReceivedEvent) {
    await this.loggingService.debug(
      MessageReceivedEventHandler,
      `Received a message: ${JSON.stringify(event)}`,
    )
    if (!event.message) {
      return
    }

    const tenant = await this.queryBus.execute<
      TenantByApplicationQuery,
      Tenant
    >(new TenantByApplicationQuery(event.message.applicationId))
    if (!tenant) {
      return
    }

    const message = Message.fromDto(event.message)
    message.messageOrder = message.receivedUnixEpoch
    message.cloudTenantId = tenant.cloudTenantId
    message.tenantId = tenant._id
    message.messageStatus = MessageStatus.SENT
    message.startedBy = ParticipantType.CUSTOMER
    message.senderName = event.message.senderName

    let conversationDocument =
      await this.chatSessionRegistryService.getConversation(
        message.applicationId,
        message.senderId,
      )

    if (!conversationDocument) {
      const conversation =
        await this.chatSessionManagerService.createConversation(message)
      conversationDocument =
        await this.chatSessionRegistryService.saveConversation(conversation)
    }

    const responseAssign = await this.chatSessionManagerService.assignAgentToSession(
      conversationDocument._id,
      conversationDocument.cloudTenantId,
    )

    // 2:not find assign to assign,14 not connect to grpc assignment or acd asm
    const checkAgentAssigned = (responseAssign.code == 2 || responseAssign.code == 14) ? false : true

    if (checkAgentAssigned == true) {
      conversationDocument.conversationState = ConversationState.INTERACTIVE
      conversationDocument.agentPicked = responseAssign.agentId
      conversationDocument.save()
    }

    message.conversationId = conversationDocument._id
    conversationDocument.conversationId = conversationDocument._id
    message.conversation = conversationDocument.toObject()
    message.conversation.conversationId = conversationDocument._id
    //save message
    const messageDocument = await this.commandBus.execute<
      SaveMessageCommand,
      Message
    >(new SaveMessageCommand(message))
    message.messageId = messageDocument._id

    let rooms = []
    if (checkAgentAssigned == true) {
      const socketIdOfAgent = await this.queryBus.execute<AllParticipantQuery, Participant>(new AllParticipantQuery(responseAssign.agentId))
      rooms.push(
        `${socketIdOfAgent.socketId}`,
      )
    } else {
      rooms.push(
        `${message.cloudTenantId}_${message.applicationId}`,
        `${message.cloudTenantId}_${message.applicationId}_supervisor`
      )
    }

    console.log(JSON.stringify(message))
    // notify to agent
    await this.commandBus.execute(
      new NotifyNewMessageToAgentCommand(
        ParticipantType.AGENT,
        checkAgentAssigned == true ? NotifyEventType.PICK_CONVERSATION : NotifyEventType.NEW_MESSAGE,
        rooms.join(','),
        {
          message: message,
        },
      ),
    )
  }
}
