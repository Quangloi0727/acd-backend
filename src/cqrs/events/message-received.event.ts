import { IEvent } from '@nestjs/cqrs';
import { MessageDto } from '../../message-consumer/dto/message.dto';
export class MessageReceivedEvent implements IEvent {
  constructor(public message: MessageDto) {}
}
