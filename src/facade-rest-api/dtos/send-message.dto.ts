import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsString, IsNumber, MaxLength, IsOptional, IsIn } from 'class-validator'

export enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    FILE = "FILE"
}

export class SendMessageDto {
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: true })
    cloudAgentId: number

    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: true })
    cloudTenantId: number

    @IsString()
    @ApiProperty({ required: true })
    conversationId: string

    @IsIn([MessageType.FILE, MessageType.IMAGE, MessageType.TEXT])
    @IsString()
    @ApiProperty({ required: true, enum: MessageType })
    messageType: string

    @IsString()
    @MaxLength(300)
    @IsOptional()
    @ApiProperty({ required: false })
    text: string

    @IsOptional()
    @ApiProperty({ format: 'binary', required: false, description: "File upload" })
    attachments: string

    @IsString()
    @ApiProperty({ required: true })
    channel: string
    
}