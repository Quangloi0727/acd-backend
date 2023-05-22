import { IsNumber, IsString } from 'class-validator';

export class JoinConversationDto {
  @IsString()
  conversationId: string;

  @IsNumber()
  cloudAgentId: number;

  @IsNumber()
  currentAgentId: number;
}
