import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ collection: 'test-message' })
export class Message {
  @Prop()
  channel: string;
  @Prop()
  conversationId: string;
  @Prop()
  senderId: string;
  @Prop()
  applicationId: string;
  @Prop({ required: false })
  tenantId: number;
  @Prop()
  messageStatus: string;
  @Prop()
  messageType: string;
  @Prop()
  messageFrom: string;
  @Prop()
  sendFrom: string;
  @Prop()
  receivedTime: Date;
  @Prop()
  receivedUnixEpoch: number;
  @Prop()
  messageOrder: number;
  @Prop()
  text: string;
  @Prop()
  phoneNumber: string;
  @Prop()
  senderName: string;
  @Prop()
  socialMessageId: string;
  @Prop()
  domain: string;
  @Prop({ type: 'object' })
  attachment: string;
  @Prop()
  suggestions: string;
  @Prop()
  sender: string;
  @Prop()
  messageResponse: string;
}

export class Attachment {
  fileName: string;
  directory: string;
  contentId: string;
  isAttachment: boolean;
  payload: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
