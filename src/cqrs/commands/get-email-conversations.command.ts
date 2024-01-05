import { ICommand } from '@nestjs/cqrs';
import { ConversationState } from 'src/common/enums'

export class GetEmailConversationsCommand implements ICommand {
  constructor(
    public tenantId: number,
    public assignedAgentIds: number[],
    public applicationIds: string[],
    public skip: number,
    public take: number,
    public state: ConversationState,
    public replyStatus: string,
    public onlyUnread: boolean,
  ) {}
}
