import { ICommand } from '@nestjs/cqrs';
import { MarkAsUnreadDto } from '../../facade-rest-api/dtos';

export class MarkEmailAsUnreadCommand implements ICommand {
  constructor(public request: MarkAsUnreadDto) {}
}
