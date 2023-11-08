import { ICommand } from '@nestjs/cqrs';
import { ReopenEmailDto } from '../../facade-rest-api/dtos/creopen-email.dto';

export class ReopenEmailConversationCommand implements ICommand {
  constructor(public body: ReopenEmailDto) {}
}
