import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ collection: 'test-conversation' })
export class Conversation {
  @Prop()
  tenantId: number;
  @Prop()
  senderId: string;
  @Prop()
  senderName: string;
  @Prop()
  applicationName: string;
  @Prop()
  applicationId: string;
  @Prop()
  channel: string;
  @Prop()
  referenceId: string;
  @Prop()
  conversationState: string;
  @Prop()
  numOfParticipants: number;
  @Prop()
  lastText: string;
  @Prop()
  lastTime: Date;
  @Prop()
  lastTimeUnixEpoch: number;
  @Prop()
  lastActionTime: Date;
  @Prop()
  lastUpdateVersion: number;
  @Prop()
  numOfmessages: number;
  @Prop()
  startedBy: string;
  @Prop()
  startedTime: Date;
  @Prop()
  closedTime: Date;
  @Prop()
  participantClosed: string;
  @Prop()
  pickConversationTime: Date;
  @Prop()
  agentPicked: number;
  @Prop()
  firstMessageId: string;
  @Prop()
  sla: string;
  @Prop()
  participants: string[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
