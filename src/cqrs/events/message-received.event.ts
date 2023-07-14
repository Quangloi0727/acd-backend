import { ICommand } from '@nestjs/cqrs';
import { MessageDto } from '../../message-consumer/dto/message.dto';
export class MessageReceivedEvent implements ICommand {
  constructor(public message: MessageDto) {}
}
