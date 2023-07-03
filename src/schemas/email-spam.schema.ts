import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseObject } from '../common/base/base-object';

export type EmailSpamDocument = EmailSpam & Document;

@Schema({ collection: 'email_spam' })
export class EmailSpam extends BaseObject<EmailSpam> {
  @Prop({ default: false })
  IsDeleted: boolean;
  @Prop()
  TenantId: number;
  @Prop()
  Email: string;
}

export const EmailSpamSchema = SchemaFactory.createForClass(EmailSpam);
