import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber } from 'class-validator';

export class AssignEmailDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: true })
  agentId: number;

  @IsArray()
  @ApiProperty({ required: true })
  emailIds: string[];
}
