import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseObject } from '../common/base/base-object';

export type EmailConversationDocument = EmailConversation & Document;

@Schema({ collection: 'email_conversation' })
export class EmailConversation extends BaseObject<EmailConversation> {
  @Prop()
  CreationTime: Date;
  @Prop({ default: false })
  IsDeleted: boolean;
  @Prop()
  DeletionTime: Date;
  @Prop()
  TenantId: number;
  @Prop()
  Subject: string;
  @Prop()
  ReceivedTime: Date;
  @Prop()
  FromEmail: string;
  @Prop()
  ToEmail: string;
  @Prop()
  CcEmail: string;
  @Prop()
  BccEmail: string;
  @Prop()
  participants: string[];
  @Prop({ default: false })
  SpamMarked: boolean;
  @Prop({ default: false })
  Readed: boolean;
  @Prop()
  EmailChannelId: number;
  @Prop({ default: false })
  SlaStatus: boolean;
  @Prop()
  Reader: number;
  @Prop()
  ReadedTime: Date;
  @Prop()
  SenderName: string;
  @Prop()
  AgentId: number;
  @Prop()
  AssignedDate: Date;

  @Prop()
  Content: string;
  @Prop()
  RelatedEmailId: string;
  @Prop()
  TimeReply: Date;
}

export const EmailConversationSchema =
  SchemaFactory.createForClass(EmailConversation);
