import { ICommand } from '@nestjs/cqrs';

export class CountEmailConversationCommand implements ICommand {
  constructor(
    public tenantId: number,
    public assignedAgentIds: number[],
    public applicationIds: string[],
    public replyStatus: string,
  ) {}
}
