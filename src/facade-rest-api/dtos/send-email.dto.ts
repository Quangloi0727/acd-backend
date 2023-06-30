import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsArray, IsOptional } from 'class-validator';
import { SendEmailRequest } from '../../protos/email-connector.pb';

export class SendEmailDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  @ApiProperty({ required: false })
  sender: string;

  @IsString()
  @Type(() => String)
  @ApiProperty({ required: true })
  email: string;

  @IsString()
  @Type(() => String)
  @ApiProperty({ required: true })
  to: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  cc: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  bcc: string;

  @IsString()
  @Type(() => String)
  @ApiProperty({ required: true })
  subject: string;

  @IsString()
  @Type(() => String)
  @ApiProperty({ required: true })
  body: string;

  @IsString()
  @Type(() => String)
  @ApiProperty({ required: true })
  conversationId: string;

  @IsOptional()
  @IsArray()
  @ApiProperty()
  attachments: EmailAttachmentDto[];

  static toSendEmailRequest(request: SendEmailDto) {
    return {
      message: {
        sender: request.sender,
        email: request.email,
        to: request.to?.split(','),
        cc: request.cc?.split(','),
        bcc: request.bcc?.split(','),
        subject: request.subject,
        body: request.body,
      },
      attachments: request.attachments,
    } as SendEmailRequest;
  }
}

export class EmailAttachmentDto {
  @IsString()
  @ApiProperty({ required: true })
  name: string;
  @ApiProperty({ required: true })
  buffer: Uint8Array;
}
