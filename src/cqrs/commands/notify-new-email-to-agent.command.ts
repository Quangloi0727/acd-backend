import { ICommand } from '@nestjs/cqrs';

export class NotifyNewEmailToAgentCommand implements ICommand {
  constructor(public data: any) {}
}
