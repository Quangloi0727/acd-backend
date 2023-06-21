import { IsNumber, IsString } from 'class-validator';

export class LeaveConversationDto {
  @IsString()
  conversationId: string;

  @IsNumber()
  currentAgentId: number;
}
