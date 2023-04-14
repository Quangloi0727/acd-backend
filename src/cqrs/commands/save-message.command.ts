import { ICommand } from '@nestjs/cqrs';
import { Message } from '../../schemas';

export class SaveMessageCommand implements ICommand {
  constructor(public message: Message) {}
}
