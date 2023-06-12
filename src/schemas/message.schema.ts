import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { BaseObject } from '../common/base/base-object';
import { MessageDto } from '../message-consumer';
import { MessageType, ParticipantType } from '../common/enums';

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
  @Prop()
  channel: string;

  @Prop({  type: mongoose.Schema.Types.ObjectId ,ref:'Conversation'})
  conversationId: string;

  @Prop()
  senderId: string;

  @Prop()
  receivedId: string;

  @Prop()
  applicationId: string;

  @Prop()
  applicationName: string;

  @Prop()
  cloudTenantId: number;

  @Prop()
  messageStatus: string;
  
  @Prop()
  messageType: string;

  @Prop()
  messageFrom: string;

  @Prop()
  sendFrom: string;

  @Prop()
  text: string;

  @Prop()
  senderName: string;

  @Prop()
  socialMessageId: string;

  @Prop()
  attachment: Attachment;

  @Prop()
  messageResponse: string;

  @Prop()
  receivedTime: Date;

  static fromDto(dto: MessageDto) {
    return new Message({
      channel: dto.channel,
      socialMessageId: dto.messageId,
      text: dto.text,
      sendFrom: dto.senderId,
      senderId: dto.senderId,
      applicationId: dto.applicationId,
      receivedTime: dto.receivedTime,
      messageFrom: ParticipantType.CUSTOMER,
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
