import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { BaseObject } from '../common/base/base-object'
import { v4 as uuidv4 } from 'uuid'

export type ConversationDocument = Conversation & Document<string>

@Schema({ collection: 'conversation' })
export class Conversation extends BaseObject<Conversation> {
  @Prop()
  tenantId: string

  @Prop()
  senderId: string

  @Prop()
  senderName: string

  @Prop()
  applicationName: string

  @Prop()
  applicationId: string

  @Prop()
  cloudTenantId: number

  @Prop()
  channel: string

  @Prop()
  conversationState: string

  @Prop()
  agentPicked: number

  @Prop()
  lastTime: Date

  @Prop()
  startedTime: Date

  @Prop()
  pickConversationTime: Date

  @Prop()
  closedTime: Date

  @Prop()
  participants: string[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
  lastMessage: string

  @Prop({ ref: 'Message' })
  messages: string[]
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation)
