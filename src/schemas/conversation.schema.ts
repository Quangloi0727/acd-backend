import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseObject } from '../common/base/base-object';

export type ConversationDocument = Conversation & Document;

@Schema({ collection: 'test-conversation' })
export class Conversation extends BaseObject<Conversation> {
  @Prop()
  tenantId: string;
  @Prop()
  senderId: string;
  @Prop()
  senderName: string;
  @Prop()
  applicationName: string;
  @Prop()
  applicationId: string;
  @Prop()
  cloudTenantId: number;
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

  conversationId: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
