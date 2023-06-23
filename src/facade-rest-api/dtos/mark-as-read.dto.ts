import { IsNumber, IsString } from 'class-validator';

export class MarkAsReadDto {
  @IsString()
  conversationId: string;

  @IsNumber()
  agentId: number;
}
