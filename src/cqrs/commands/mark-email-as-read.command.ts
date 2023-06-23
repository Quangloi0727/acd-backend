import { ICommand } from '@nestjs/cqrs';
import { MarkAsReadDto } from '../../facade-rest-api/dtos';

export class MarkEmailAsReadCommand implements ICommand {
  constructor(public request: MarkAsReadDto) {}
}
