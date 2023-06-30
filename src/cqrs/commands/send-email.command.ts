import { ICommand } from '@nestjs/cqrs';
import { SendEmailDto } from '../../facade-rest-api/dtos/send-email.dto';

export class SendEmailCommand implements ICommand {
  constructor(public message: SendEmailDto) {}
}
