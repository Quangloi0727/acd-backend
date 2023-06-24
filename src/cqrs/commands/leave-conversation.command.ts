import { ICommand } from '@nestjs/cqrs';
import { LeaveConversationDto } from '../../facade-rest-api/dtos';
export class LeaveConversationCommand implements ICommand {
  constructor(public request: LeaveConversationDto) {}
}
