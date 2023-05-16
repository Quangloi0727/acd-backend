import { IsNumber, IsString } from "class-validator"

export class PickConversationDto{
    @IsNumber()
    cloudAgentId:number

    @IsNumber()
    cloudTenantId: number

    @IsString()
    conversationId: string
}