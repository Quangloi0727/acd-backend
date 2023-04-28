import { Injectable } from '@nestjs/common'
import { Conversation, ConversationDocument, Message, MessageDocument, Participant, ParticipantDocument } from '../schemas'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ConversationState, ParticipantType } from '../common/enums'
import { ChannelType, MessageStatus } from '../common/enums'
import { BadRequestException } from '@nestjs/common/exceptions'
import * as moment from 'moment'

@Injectable()
export class ChatSessionRegistryService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly model: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Participant.name)
    private readonly participantModel: Model<ParticipantDocument>,
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
      .sort('-lastTime')
      .exec()
    return conversation &&
      conversation.conversationState !== ConversationState.CLOSE
      ? conversation
      : null
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
    console.log("Data receive from zalo connector to insert table message: ", data)
    const { conversationId, cloudAgentId, messageType, text, attachment } = data
    const findInfoMessage = await this.messageModel.findOne({ conversationId: conversationId })
    const findInfoAgent = await this.participantModel.findOne({ cloudAgentId: cloudAgentId })
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
      sentFrom: cloudAgentId,
      receivedTime: new Date(),
      receivedUnixEpoch: moment(new Date()).valueOf(),
      messageOrder: moment(new Date()).valueOf(),
      text: text,
      senderName: findInfoAgent?.fullName || "",
      socialMessageId: findInfoMessage.socialMessageId,
      attachment: {
        fileName: attachment?.fileName || "",
        directory: '',
        contentId: '',
        isAttachment: true,
        payload: ''
      }
    })
    return this.messageModel.create(message)
  }

}
