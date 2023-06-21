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
  @Prop()
  EmailChannelId: string;
  @Prop()
  SlaStatus: boolean;
  @Prop()
  Reader: number;
  @Prop()
  ReadTime: Date;
  @Prop()
  SenderName: string;
  @Prop()
  AgentId: number;
  @Prop()
  AssignedDate: Date;
}

export const EmailConversationSchema =
  SchemaFactory.createForClass(EmailConversation);
