import { ICommand } from '@nestjs/cqrs';

export class CountEmailConversationCommand implements ICommand {
  constructor(public agentIds: string) {}
}
