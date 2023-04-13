import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssignmentClient } from '../providers/grpc/grpc.module';
import { AgentAssignmentServiceClient } from '../protos/assignment.pb';
import {
  Conversation,
  ConversationDocument,
} from '../schemas/conversation.schema';
import { Message, MessageDocument } from '../schemas/message.schema';

@Injectable()
export class ChatSessionManagerService {
  constructor(
    @Inject(AssignmentClient)
    private agentAssignmentService: AgentAssignmentServiceClient,
    @InjectModel(Conversation.name)
    private readonly conversationRepository: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageRepository: Model<MessageDocument>,
  ) {}

  async createSession(messageId: string): Promise<ConversationDocument> {
    const message = await this.messageRepository.findById(messageId).exec();

    const conversation = new Conversation();
    conversation.senderId = message.senderId;
    conversation.senderName = message.senderName;
    conversation.channel = message.channel;
    conversation.applicationId = message.applicationId;
    conversation.lastText = message.text;

    const conversationDocument = await new this.conversationRepository(
      conversation,
    ).save();

    message.conversationId = conversationDocument._id;
    await this.messageRepository.findByIdAndUpdate(message._id, message).exec();
    return conversationDocument;
  }

  async assignAgentToSession(conversationId: string, tenantId: number) {
    const availableAgentId =
      await this.agentAssignmentService.assignAgentToConversation({
        conversationId: conversationId,
        tenantId: tenantId,
      });

    return availableAgentId;
  }

  async getAllMessageByConversationId(
    conversationId: string,
    tenantId: number,
  ): Promise<MessageDocument[]> {
    return await this.messageRepository
      .find({
        conversationId: conversationId,
      })
      .exec();
  }
}
