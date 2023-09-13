import { IsString } from 'class-validator';

export class FindByConversationDto {
  @IsString()
  conversationId: string;
}
