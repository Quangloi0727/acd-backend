import { IQuery } from '@nestjs/cqrs';
export class ChatHistoryQuery implements IQuery {
  constructor(readonly conversationId: string) {}
}
