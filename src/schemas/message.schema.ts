import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseObject } from '../common/base/base-object';
import { MessageDto } from '../message-consumer';
import { MessageType, ParticipantType } from '../common/enums';
import { Conversation } from './conversation.schema';
import { v4 as uuidv4 } from 'uuid';

export type MessageDocument = Message & Document;
export class Attachment {
  fileName: string;
  directory: string;
  contentId: string;
  isAttachment: boolean;
  payload: string;
}

@Schema({ collection: 'message' })
export class Message extends BaseObject<Message> {
  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  _id: string;
  @Prop()
  channel: string;
  @Prop()
  conversationId: string;
  @Prop()
  senderId: string;
  @Prop()
  applicationId: string;
  @Prop()
  cloudTenantId: number;
  @Prop()
  tenantId: string;
  @Prop()
  messageStatus: string;
  @Prop()
  messageType: string;
  @Prop()
  messageFrom: string;
  @Prop()
  sentFrom: string;
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
  @Prop()
  attachment: Attachment;
  @Prop()
  suggestions: string;
  @Prop()
  sender: string;
  @Prop()
  messageResponse: string;
  conversation: Conversation;
  startedBy: ParticipantType;
  messageId: string;

  static fromDto(dto: MessageDto) {
    return new Message({
      channel: dto.channel,
      socialMessageId: dto.messageId,
      text: dto.text,
      sentFrom: dto.senderId,
      senderId: dto.senderId,
      applicationId: dto.applicationId,
      messageFrom: ParticipantType.CUSTOMER,
      receivedTime: new Date(dto.timestamp),
      receivedUnixEpoch: dto.timestamp,
      messageType:
        dto.media && dto.media.length > 0
          ? dto.media[0].mediaType.toLowerCase() === 'image'
            ? MessageType.IMAGE
            : MessageType.FILE
          : MessageType.TEXT,
    });
  }
}

export const MessageSchema = SchemaFactory.createForClass(Message);
