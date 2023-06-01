import { ICommand } from '@nestjs/cqrs';
import { JoinConversationDto } from '../../facade-rest-api/dtos';
export class JoinConversationCommand implements ICommand {
  constructor(public request: JoinConversationDto) {}
}
