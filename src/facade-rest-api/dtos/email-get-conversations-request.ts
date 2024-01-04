import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsArray } from "class-validator"
import { ConversationState } from "src/common/enums"

export class GetEmailConversationRequest {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false })
  tenantId: number;

  @ApiProperty({ required: false })
  assignedAgentIds: number[];

  @ApiProperty({ required: false })
  @IsArray()
  applicationIds: string[];

  // phân trang
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false })
  skip: number;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false })
  take: number;
  //Lấy danh sách theo các trạng thái OPEN, ASSIGNED, CLOSED
  @ApiProperty({ required: false , enum: ['OPEN', 'INTERACTIVE', 'NON_INTERACTIVE', 'CLOSED']})
  state: ConversationState;

  // lọc
  @ApiProperty({ required: false })
  replyStatus: string;

  @ApiProperty({ required: false })
  onlyUnread: boolean;
}
