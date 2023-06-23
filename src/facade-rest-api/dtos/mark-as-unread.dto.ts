import { IsArray } from 'class-validator';

export class MarkAsUnreadDto {
  @IsArray()
  conversationIds: string[];
}
