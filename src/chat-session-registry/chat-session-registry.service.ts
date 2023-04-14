import { Injectable } from '@nestjs/common';
import { Conversation, ConversationDocument } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationState } from '../common/enums';

@Injectable()
export class ChatSessionRegistryService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly model: Model<ConversationDocument>,
  ) {}
  async getConversation(
    applicationId: string,
    senderId,
  ): Promise<ConversationDocument> {
    const conversation = await this.model
      .findOne({
        applicationId: applicationId,
        senderId: senderId,
      })
      .exec();

    return conversation &&
      conversation.conversationState != ConversationState.CLOSE
      ? conversation
      : null;
  }

  async saveConversation(
    conversation: Conversation,
  ): Promise<ConversationDocument> {
    return new this.model({ ...conversation }).save();
  }
}
