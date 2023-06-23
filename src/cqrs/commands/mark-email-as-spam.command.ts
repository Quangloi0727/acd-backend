import { ICommand } from '@nestjs/cqrs';
import { MarkAsSpamDto } from '../../facade-rest-api/dtos';

export class MarkEmailAsSpamCommand implements ICommand {
  constructor(public request: MarkAsSpamDto, public isSpam: boolean) {}
}
