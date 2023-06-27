import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from '../schemas';
import { BadRequestException } from '@nestjs/common';
import { ConversationState } from '../common/enums';

@Injectable()
export class ChatSessionSupervisingService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly model: Model<ConversationDocument>,
  ) {}

  async joinConversation(
    conversationId: string,
    agentId: number,
  ): Promise<Conversation> {
    const conversation = await this.model.findById(conversationId).lean();
    if (!conversation) throw new BadRequestException('conversation not found!');
    if (conversation.conversationState != ConversationState.INTERACTIVE)
      throw new BadRequestException(
        'Conversation has not in interactive status!',
      );

    const indexOf = conversation.participants.indexOf(agentId);
    if (indexOf > -1)
      throw new BadRequestException('Agent has joined conversation yet!');

    const conversationUpdated = await this.model
      .findByIdAndUpdate(
        conversationId,
        {
          $push: { participants: agentId },
        },
        { new: true },
      )
      .lean();
    return conversationUpdated;
  }

  async unassignConversation(
    conversationId: string,
    // agentId: number,
  ): Promise<Conversation> {
    const conversation = await this.model.findById(conversationId).lean();
    if (!conversation) throw new BadRequestException('conversation not found!');
    if (conversation.conversationState != ConversationState.INTERACTIVE)
      throw new BadRequestException(
        'Conversation has not in interactive status!',
      );
    const indexOf = conversation.participants.indexOf(conversation.agentPicked);
    if (indexOf < 0)
      throw new BadRequestException('Conversation has not handled by agent!');

    const participants = [...conversation.participants];
    participants.splice(indexOf, 1);
    await this.model
      .findByIdAndUpdate(
        conversationId,
        {
          conversationState: ConversationState.OPEN,
          agentPicked: null,
          pickConversationTime: null,
          $set: { participants: participants },
        },
        { new: true },
      )
      .lean();
    return conversation;
  }

  async leaveConversation(
    conversationId: string,
    agentId: number,
  ): Promise<Conversation> {
    const conversation = await this.model.findById(conversationId).lean();
    if (!conversation) throw new BadRequestException('conversation not found!');
    if (conversation.conversationState != ConversationState.INTERACTIVE)
      throw new BadRequestException(
        'Conversation has not in interactive status!',
      );

    const indexOf = conversation.participants.indexOf(agentId);
    if (indexOf < 0)
      throw new BadRequestException('Conversation has not handled by agent!');

    const participants = [...conversation.participants];
    participants.splice(indexOf, 1);
    await this.model
      .findByIdAndUpdate(
        conversationId,
        {
          $set: { participants: participants },
        },
        { new: true },
      )
      .lean();
    return conversation;
  }

  async transferConversation(
    conversationId: string,
    currentAgentId: number,
    newAgentId: number,
  ): Promise<Conversation> {
    const conversation = await this.model.findById(conversationId).lean();
    if (!conversation) throw new BadRequestException('conversation not found!');
    if (conversation.conversationState != ConversationState.INTERACTIVE)
      throw new BadRequestException(
        'Conversation has not in interactive status!',
      );

    const indexOf = conversation.participants.indexOf(currentAgentId);
    if (indexOf < 0)
      throw new BadRequestException('Conversation has not handled by agent!');

    conversation.participants.splice(indexOf, 1);
    conversation.participants.push(newAgentId);

    const conversationUpdated = await this.model
      .findByIdAndUpdate(
        conversationId,
        {
          agentPicked: newAgentId,
          pickConversationTime: new Date(),
          $set: { participants: conversation.participants },
        },
        { new: true },
      )
      .lean();
    return conversationUpdated;
  }
}
