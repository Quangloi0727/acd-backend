import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { GetConversationByIdQuery } from '../detail.query'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Conversation, ConversationDocument } from 'src/schemas'

@QueryHandler(GetConversationByIdQuery)
export class GetConversationByIdQueryHandler
    implements IQueryHandler<GetConversationByIdQuery, ConversationDocument>
{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
    ) { }

    async execute(query: GetConversationByIdQuery): Promise<ConversationDocument> {
        return this.model.findById(query.conversationId).populate("lastMessage").populate("messages")
    }
}
