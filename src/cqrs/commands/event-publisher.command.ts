import { ICommand } from '@nestjs/cqrs';

export class EventPublisherCommand implements ICommand {
  constructor(public topic: string, public data: any) {}
}
