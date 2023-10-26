import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { BaseObject } from '../common/base/base-object';

export type ConversationDocument = Conversation & Document<string>;

@Schema({ collection: 'conversation' })
export class Conversation extends BaseObject<Conversation> {
  @Prop({ index: true })
  senderId: string;

  @Prop({ index: true })
  senderName: string;

  @Prop()
  applicationName: string;

  @Prop({ index: true })
  applicationId: string;

  @Prop({ index: true })
  cloudTenantId: number;

  @Prop()
  channel: string;

  @Prop({ index: true })
  conversationState: string;

  @Prop({ index: true })
  agentPicked: number;

  @Prop()
  agentStartOutbound: number;

  @Prop()
  startedBy: string;

  @Prop()
  lastTime: Date;

  @Prop({ index: true })
  startedTime: Date;

  @Prop({ index: true, default: false })
  isReply: Boolean;

  @Prop()
  pickConversationTime: Date;

  @Prop()
  closedTime: Date;

  @Prop({ index: true })
  participants: any[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message', index: true })
  lastMessage: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  referenceId: string;

  @Prop({ ref: 'Message', index: true })
  messages: string[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ applicationId: 1, channel: 1, cloudTenantId: 1, conversationState: 1 });
