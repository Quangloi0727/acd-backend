import { IsString } from 'class-validator';

export class MarkAsSpamDto {
  @IsString()
  conversationId: string;
}
