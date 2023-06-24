import { ICommand } from '@nestjs/cqrs';

export class GetEmailConversationsCommand implements ICommand {
  constructor(
    public query: string,
    public agentId: string,
    public onlySpam: boolean,
    public onlyUnread: boolean,
    public row: number,
  ) {}
}
