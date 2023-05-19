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
  ConversationState,
  MessageStatus,
  NotifyEventType,
  ParticipantType,
} from '../../../common/enums'
import {
  NotifyNewMessageToAgentCommand,
  SaveMessageCommand,
  TenantByApplicationQuery
} from '../../../cqrs'
import { Message, Tenant } from '../../../schemas'

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
    await this.loggingService.debug(MessageReceivedEventHandler, `Received a message from zalo connector: ${JSON.stringify(event)}`)
    await this.loggingService.info(MessageReceivedEventHandler, `Received a message from zalo connector,messageId: ${JSON.stringify(event?.message?.messageId)}`)

    if (!event.message) return

    const tenant = await this.queryBus.execute<TenantByApplicationQuery, Tenant>(new TenantByApplicationQuery(event.message.applicationId))
    if (!tenant) return

    const message = Message.fromDto(event.message)
    message.cloudTenantId = tenant.cloudTenantId
    message.messageStatus = MessageStatus.SENT
    message.senderName = event.message.senderName
    message.receivedTime = new Date()
    message.applicationName = tenant['configs'][message.applicationId]['applicationName']
    if (event?.message?.media && event?.message?.media.length) {
      message.attachment = {
        fileName: event.message.media[0].media,
        directory: '',
        contentId: '',
        isAttachment: true,
        payload: ''
      }
    }

    let rooms = []
    let checkAgentAssigned

    let conversationDocument = await this.chatSessionRegistryService.getConversation(message.applicationId, message.senderId)
    await this.loggingService.debug(MessageReceivedEventHandler, `ConversationState: ${conversationDocument?.conversationState || "New conversation"}`)

    if (!conversationDocument) {
      const conversation = await this.chatSessionManagerService.createConversation(message)
      const conversationCreated = await this.chatSessionRegistryService.saveConversation(conversation)

      //save message
      message.conversationId = conversationCreated._id
      const messageDocument = await this.commandBus.execute<SaveMessageCommand, Message>(new SaveMessageCommand(message))
      conversationCreated.lastMessage = messageDocument['_id']
      conversationCreated.messages.push(messageDocument['_id'])

      await this.requestGetAgentOnline(conversationCreated, checkAgentAssigned, rooms, messageDocument)

      message['conversation'] = conversationCreated.toObject()
      message['conversationState'] = ConversationState.INTERACTIVE
      message['conversation']['conversationState'] = ConversationState.INTERACTIVE
      message['lastMessage'] = {
        messageType: message.messageType,
        text: message.text
      }
    } else {
      if (conversationDocument.conversationState == ConversationState.OPEN) {
        message.conversationId = conversationDocument._id
        const messageDocument = await this.commandBus.execute<SaveMessageCommand, Message>(new SaveMessageCommand(message))
        conversationDocument.messages.push(messageDocument['_id'])
        conversationDocument.lastTime = new Date()
        conversationDocument.lastMessage = messageDocument['_id']

        await this.requestGetAgentOnline(conversationDocument, checkAgentAssigned, rooms, message)

        message['conversation'] = conversationDocument.toObject()
        message['lastMessage'] = {
          messageType: message.messageType,
          text: message.text
        }
      } else if (conversationDocument.conversationState == ConversationState.INTERACTIVE) {
        message.conversationId = conversationDocument._id
        const messageDocument = await this.commandBus.execute<SaveMessageCommand, Message>(new SaveMessageCommand(message))
        conversationDocument.messages.push(messageDocument['_id'])
        conversationDocument.lastTime = new Date()
        conversationDocument.lastMessage = messageDocument['_id']
        conversationDocument.save()
        // set room
        rooms.push(
          `${conversationDocument.agentPicked}_${message.cloudTenantId}_${message.applicationId}`,
        )
        message['messageId'] = messageDocument['_id']
        message['conversationState'] = ConversationState.INTERACTIVE
        message['conversation'] = {}
        message['conversation']['conversationState'] = ConversationState.INTERACTIVE
        await this.loggingService.info(MessageReceivedEventHandler, `Push to room: ${rooms.join(',')}`)
        await this.loggingService.debug(MessageReceivedEventHandler, `Message send: ${JSON.stringify(message)}`)

        // notify to agent
        return await this.notifyToAgent(rooms, NotifyEventType.MESSAGE_TRANSFERED, message)

      } else if (conversationDocument.conversationState == ConversationState.CLOSE) {
        const conversation = await this.chatSessionManagerService.createConversation(message)
        const conversationCreated = await this.chatSessionRegistryService.saveConversation(conversation)

        //save message
        message.conversationId = conversationCreated._id
        const messageDocument = await this.commandBus.execute<SaveMessageCommand, Message>(new SaveMessageCommand(message))

        conversationCreated.lastMessage = messageDocument['_id']
        conversationCreated.messages.push(messageDocument['_id'])

        await this.requestGetAgentOnline(conversationCreated, checkAgentAssigned, rooms, messageDocument)

        message['conversation'] = conversationCreated.toObject()
        message['conversationState'] = ConversationState.INTERACTIVE
        message['conversation']['conversationState'] = ConversationState.INTERACTIVE
        message['lastMessage'] = {
          messageType: message.messageType,
          text: message.text
        }
      }
    }

    await this.loggingService.info(MessageReceivedEventHandler, `Push to room: ${rooms.join(',')}`)
    await this.loggingService.debug(MessageReceivedEventHandler, `Message send: ${JSON.stringify(message)}`)

    // notify to agent
    const type = (checkAgentAssigned == true ? NotifyEventType.ASSIGN_CONVERSATION : NotifyEventType.NEW_MESSAGE_NO_READY)
    
    await this.notifyToAgent(rooms, type, message)

  }

  private async notifyToAgent(rooms, type, message) {
    await this.commandBus.execute(
      new NotifyNewMessageToAgentCommand(
        ParticipantType.AGENT,
        type,
        rooms.join(','),
        {
          message: message,
        },
      ),
    )
  }

  private async requestGetAgentOnline(conversationDocument, checkAgentAssigned, rooms, message) {
    const responseAssign = await this.chatSessionManagerService.assignAgentToSession(conversationDocument._id, conversationDocument.cloudTenantId)
    // 2:not find assign to assign,14 not connect to grpc assignment or acd asm
    checkAgentAssigned = (responseAssign.code == 2 || responseAssign.code == 14) ? false : true
    await this.loggingService.info(MessageReceivedEventHandler, `response assign agent is: ${responseAssign.agentId}`)
    if (checkAgentAssigned == true) {
      conversationDocument.conversationState = ConversationState.INTERACTIVE
      conversationDocument.agentPicked = responseAssign.agentId
      // set room
      rooms.push(
        `${responseAssign.agentId}_${message.cloudTenantId}_${message.applicationId}`,
      )
    } else {
      rooms.push(
        `${message.cloudTenantId}_${message.applicationId}`
      )
    }
    conversationDocument.save()
  }

}
