import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Attachment, EmailDto } from '../message-consumer';
import { BaseObject } from '../common/base/base-object';

export type EmailDocument = Email & Document;

@Schema({ collection: 'email' })
export class Email extends BaseObject<Email> {
  @Prop()
  CreationTime: Date;
  @Prop()
  LastModificationTime: Date;
  @Prop({ default: false })
  IsDeleted: boolean;
  @Prop()
  DeletionTime: Date;
  @Prop()
  TenantId: number;
  @Prop({ length: 255 })
  Subject: string;
  @Prop({ length: 255 })
  FromEmail: string;
  @Prop({ length: 255 })
  ToEmail: string;
  @Prop({ length: 255 })
  CcEmail: string;
  @Prop({ length: 255 })
  BccEmail: string;
  @Prop()
  Content: string;
  @Prop({ length: 50 })
  Status: string;
  @Prop()
  AgentId: number;
  @Prop()
  AssignedDate: Date;
  @Prop()
  ReceivedTime: Date;
  @Prop()
  RelatedEmailId: string;
  @Prop({ default: false })
  SpamMarked: boolean;
  @Prop({ default: 'inbound' })
  Direction: string;
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
  SentTime: Date;
  @Prop({ type: Object })
  attachments: Attachment[];

  static fromDto(dto: EmailDto) {
    return new Email({
      CreationTime: new Date(),
      Subject: dto.subject,
      SenderName: this.getEmailName(dto.from),
      FromEmail: this.checkAndParseEmailAddress(dto.from),
      ToEmail: this.checkAndParseEmailAddress(dto.to),
      CcEmail: this.checkAndParseEmailAddress(dto.cc),
      BccEmail: this.checkAndParseEmailAddress(dto.bcc),
      Content: dto.html,
      ReceivedTime: new Date((dto.ctime ?? 0) * 1000),
      attachments: dto.attachments,
    });
  }

  static getEmailName(inputString: string): string {
    if (!inputString) return inputString;
    const regex = /([^<]+)\s*</g;
    const names: string[] = [];
    let match;

    while ((match = regex.exec(inputString))) {
      const name = match[1].trim();
      names.push(name);
    }
    if (names.length) return names.join(',');
    return inputString;
  }

  static checkAndParseEmailAddress(inputString: string): string {
    if (!inputString) return inputString;
    const emails = [];
    for (const e of inputString.split(',')) {
      const regex = /[^\s<>]+@[^\s<>]+/g;
      const results = e.match(regex);
      if (results) emails.push(results.join(','));
      else emails.push(e);
    }
    return emails.join(',');
  }
}

export const EmailSchema = SchemaFactory.createForClass(Email);
