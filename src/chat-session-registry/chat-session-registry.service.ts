import { Injectable } from '@nestjs/common';
import { Conversation, ConversationDocument, Message, MessageDocument } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParticipantType } from '../common/enums';
import { ChannelType, MessageStatus } from '../common/enums';
import { BadRequestException } from '@nestjs/common/exceptions';
import { LoggingService } from '../providers/logging/logging.service';

@Injectable()
export class ChatSessionRegistryService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly model: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
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
      .exec();
    return conversation;
  }

  async saveConversation(
    conversation: Conversation,
  ): Promise<ConversationDocument> {
    return new this.model({ ...conversation }).save();
  };

  async checkChatSessionByConversationId(conversationId) {
    return this.model.findOne({ _id: conversationId });
  }

  async saveMessage(data) {
    await this.loggingService.debug(ChatSessionRegistryService, `Data receive from grpc to insert table message : ${JSON.stringify(data)}`);
    const { conversationId, cloudAgentId, messageType, text, attachment } = data;
    const findInfoConver = await this.model.findOne({ _id: conversationId }).lean().exec();
    if (!findInfoConver) throw new BadRequestException("Not find conversationId !");
    const message = new Message({
      channel: ChannelType.ZL_MESSAGE,
      conversationId: conversationId,
      senderId: cloudAgentId,
      applicationId: findInfoConver.applicationId,
      cloudTenantId: findInfoConver.cloudTenantId,
      receivedId: findInfoConver.senderId,
      messageStatus: MessageStatus.SENT,
      messageType: messageType,
      messageFrom: ParticipantType.AGENT,
      sendFrom: cloudAgentId,
      receivedTime: new Date(),
      text: text,
      attachment: {
        fileName: attachment?.fileName || "",
        directory: '',
        contentId: '',
        isAttachment: true,
        payload: ''
      }
    });
    const messageCreated = await this.messageModel.create(message);
    await this.model.findByIdAndUpdate(conversationId, { $push: { messages: messageCreated['_id'] }, lastMessage: messageCreated['_id'], isReply: true, lastTime: new Date() }).exec();
    messageCreated['conversationId'] = conversationId;
    return messageCreated;
  }

}
