import { IsNumber, IsOptional, IsString } from "class-validator"

export class FindBySenderDto {
    @IsString()
    applicationId: string

    @IsNumber()
    @IsOptional()
    cloudAgentId: number

    @IsNumber()
    cloudTenantId: number

    @IsString()
    senderId: string

    @IsNumber()
    pageSize: number
}