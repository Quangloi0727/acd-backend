import { IsArray, IsNumber, IsOptional } from "class-validator"

export class FindByChannelsAndStatesDto {
    @IsArray()
    applicationIds: []

    @IsArray()
    channels: []

    @IsNumber()
    @IsOptional()
    cloudAgentId: number

    @IsNumber()
    cloudTenantId: number

    @IsArray()
    conversationStates: number

    @IsNumber()
    currentPage: number

    @IsNumber()
    pageSize: number
}