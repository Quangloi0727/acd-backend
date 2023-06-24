import { IEvent } from '@nestjs/cqrs';
import { EmailDto } from '../../message-consumer/dto/email.dto';
export class EmailReceivedEvent implements IEvent {
  constructor(public email: EmailDto) {}
}
