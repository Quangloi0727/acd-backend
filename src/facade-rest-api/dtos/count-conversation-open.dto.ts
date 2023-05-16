import { IsArray, IsNumber, IsOptional } from "class-validator"

export class CountConversationOpenDto {
    @IsArray()
    supportApplicationIds: []

    @IsNumber()
    tenantId: number

    @IsNumber()
    @IsOptional()
    agentId: number
}