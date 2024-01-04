import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class EmailCountRequest {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false })
  tenantId: number;

  @ApiProperty({ required: false })
  assignedAgentIds: number[];

  @ApiProperty({ required: false })
  @IsArray()
  applicationIds: string[];

  @ApiProperty({ required: false })
  replyStatus: string;
}
