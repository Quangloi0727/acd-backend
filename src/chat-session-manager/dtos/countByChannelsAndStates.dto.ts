import { IsArray, IsNumber, IsOptional, IsString } from "class-validator"

export class CountByChannelsAndStatesDto {
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
}