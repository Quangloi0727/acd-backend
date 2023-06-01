import { IsNumber, IsString } from "class-validator"

export class CloseConversationDto {
    @IsString()
    closeMode: string

    @IsNumber()
    cloudAgentId: number

    @IsString()
    conversationId: string
}