import { ICommand } from '@nestjs/cqrs';
import { PickEmailDto } from '../../facade-rest-api/dtos/pick-email.dto';

export class AgentPickConversationCommand implements ICommand {
  constructor(public body: PickEmailDto) {}
}
