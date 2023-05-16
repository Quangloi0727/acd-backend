import { IsNumber, IsString } from "class-validator"

export class ReopenConversationDto {
    @IsString()
    applicationId: string

    @IsNumber()
    cloudAgentId: number

    @IsNumber()
    cloudTenantId: number

    @IsString()
    referenceId: string

    @IsString()
    senderId: string
}