import { ICommand } from '@nestjs/cqrs';
import { UnassignConversationDto } from '../../facade-rest-api/dtos';
export class UnassignConversationCommand implements ICommand {
  constructor(public request: UnassignConversationDto) {}
}
