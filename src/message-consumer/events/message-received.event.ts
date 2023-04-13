import { IEvent } from '@nestjs/cqrs';
export class MessageReceivedEvent implements IEvent {
  messageId: string;
  constructor(messageId: string) {
    this.messageId = messageId;
  }
}
