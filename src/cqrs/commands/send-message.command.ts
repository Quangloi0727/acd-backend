import { ICommand } from '@nestjs/cqrs'
import { SendMessageDto } from '../../facade-rest-api/dtos/send-message.dto'

export class SendMessageCommand implements ICommand {
    constructor(
        public message: SendMessageDto,
        public attachments: any
    ) { }
}
