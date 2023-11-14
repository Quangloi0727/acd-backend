import { ICommand } from '@nestjs/cqrs';

export class CountEmailConversationCommand implements ICommand {
  constructor(
    public tenantId: number,
    public agentIds: string,
    public applicationIds: string,
    public replyStatus: string,
  ) {}
}
