import { ICommand } from '@nestjs/cqrs';
import { TransferConversationDto } from '../../facade-rest-api/dtos';
export class TransferConversationCommand implements ICommand {
  constructor(public request: TransferConversationDto) {}
}
