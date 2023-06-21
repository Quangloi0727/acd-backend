import { ICommand } from '@nestjs/cqrs';
import { Email } from '../../schemas';

export class SaveEmailCommand implements ICommand {
  constructor(public email: Email) {}
}
