import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class CloseEmailDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: true })
  agentId: number;

  @ApiProperty({ required: true })
  emailId: string;
}
