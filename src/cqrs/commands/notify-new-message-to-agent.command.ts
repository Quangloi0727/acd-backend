import { ICommand } from '@nestjs/cqrs';
import { NotifyEventType, ParticipantType } from '../../common/enums';

export class NotifyNewMessageToAgentCommand implements ICommand {
  constructor(
    public participant: ParticipantType,
    public event: NotifyEventType,
    public room: string,
    public data: any,
  ) {}
}
