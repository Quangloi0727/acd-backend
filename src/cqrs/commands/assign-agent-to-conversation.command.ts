import { ICommand } from '@nestjs/cqrs';

export class AssignAgentToConversationCommand implements ICommand {
  constructor(public agentId: number, public conversationIds: string[]) {}
}
