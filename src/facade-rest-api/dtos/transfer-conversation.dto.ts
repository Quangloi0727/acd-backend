import { IsNumber, IsString } from 'class-validator';

export class TransferConversationDto {
  @IsString()
  conversationId: string;

  @IsNumber()
  currentAgentId: number;

  @IsNumber()
  newAgentId: number;
}
