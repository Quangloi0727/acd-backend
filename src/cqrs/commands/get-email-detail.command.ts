import { ICommand } from '@nestjs/cqrs';

export class GetEmailDetailCommand implements ICommand {
  constructor(public conversationId: string) {}
}
