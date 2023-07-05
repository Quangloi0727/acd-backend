import { IQuery } from '@nestjs/cqrs'
export class GetConversationByIdQuery implements IQuery {
    constructor(readonly conversationId: string) { }
}
