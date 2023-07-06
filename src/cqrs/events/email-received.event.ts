import { ICommand } from '@nestjs/cqrs';
import { EmailDto } from '../../message-consumer/dto/email.dto';
export class EmailReceivedEvent implements ICommand {
  constructor(public email: EmailDto) {}
}
