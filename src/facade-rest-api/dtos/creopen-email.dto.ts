import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ReopenEmailDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: true })
  agentId: number;

  @ApiProperty({ required: true })
  @IsArray()
  emailIds: string[];
}
