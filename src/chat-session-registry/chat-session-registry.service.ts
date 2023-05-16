import { Injectable } from '@nestjs/common'
import { Conversation, ConversationDocument, Message, MessageDocument, Participant, ParticipantDocument } from '../schemas'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ConversationState, ParticipantType } from '../common/enums'
import { ChannelType, MessageStatus } from '../common/enums'
import { BadRequestException } from '@nestjs/common/exceptions'
import * as moment from 'moment'
import { LoggingService } from 'src/providers/logging/logging.service'

@Injectable()
export class ChatSessionRegistryService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly model: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Participant.name)
    private readonly participantModel: Model<ParticipantDocument>,
    private readonly loggingService: LoggingService
  ) { }
  async getConversation(
    applicationId: string,
    senderId,
  ): Promise<ConversationDocument> {
    const conversation = await this.model
      .findOne({
        applicationId: applicationId,
        senderId: senderId,
      })
      .sort('-_id')
      .exec()
    return conversation
  }

  async saveConversation(
    conversation: Conversation,
  ): Promise<ConversationDocument> {
    return new this.model({ ...conversation }).save()
  };

  async checkChatSessionByConversationId(conversationId): Promise<Boolean> {
    const findChatSession = await this.model.findOne({ _id: conversationId })
    return Boolean(findChatSession)
  }

  async saveMessage(data) {
    await this.loggingService.info(ChatSessionRegistryService, `Data agent send from client to zalo, conversationId: ${JSON.stringify(data.conversationId)}`)
    await this.loggingService.debug(ChatSessionRegistryService, `Data agent send from client to zalo: ${JSON.stringify(data)}`)
    console.log("Data receive from zalo connector to insert table message: ", data)
    const { conversationId, cloudAgentId, messageType, text, attachment } = data
    const findInfoMessage = await this.messageModel.findOne({ conversationId: conversationId })
    if (!findInfoMessage) throw new BadRequestException("Not find conversationId !")
    const message = new Message({
      channel: ChannelType.ZL_MESSAGE,
      conversationId: conversationId,
      senderId: cloudAgentId,
      applicationId: findInfoMessage.applicationId,
      cloudTenantId: findInfoMessage.cloudTenantId,
      tenantId: findInfoMessage.tenantId,
      messageStatus: MessageStatus.SENT,
      messageType: messageType,
      messageFrom: ParticipantType.AGENT,
      sendFrom: cloudAgentId,
      receivedTime:new Date(),
      text: text,
      socialMessageId: findInfoMessage.socialMessageId,
      attachment: {
        fileName: attachment?.fileName || "",
        directory: '',
        contentId: '',
        isAttachment: true,
        payload: ''
      }
    })
    const messageCreated = await this.messageModel.create(message)
    await this.model.findByIdAndUpdate(conversationId, { $push: { messages: messageCreated['_id'] } })
    messageCreated['conversationId'] = conversationId
    return messageCreated
  }

}
