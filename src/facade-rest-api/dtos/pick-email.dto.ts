import { IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class PickEmailDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: true })
  agentId: number;

  @IsNumber()
  tenantId: number;

  @ApiProperty({ required: true })
  emailId: string;
}
