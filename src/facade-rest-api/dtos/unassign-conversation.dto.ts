import { IsNumber, IsString } from 'class-validator';

export class UnassignConversationDto {
  @IsString()
  conversationId: string;

  @IsNumber()
  currentAgentId: number;
}
