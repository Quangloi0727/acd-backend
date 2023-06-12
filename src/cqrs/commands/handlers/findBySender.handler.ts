import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Conversation, ConversationDocument, Message, MessageDocument } from "../../../schemas"
import { LoggingService } from "../../../providers/logging"
import { FindBySenderCommand } from "../findBySender.command"
import _ from 'underscore'

@CommandHandler(FindBySenderCommand)
export class FindBySenderCommandHandler implements ICommandHandler<FindBySenderCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        @InjectModel(Message.name)
        private readonly modelMessage: Model<MessageDocument>,
        private readonly loggingService: LoggingService
    ) { }

    async execute(body) {
        const data = body.body
        await this.loggingService.debug(FindBySenderCommandHandler, `Data receive is: ${JSON.stringify(data)}`)
        const { applicationId, cloudTenantId, pageSize, senderId } = data

        const _query: any = {
            applicationId,
            cloudTenantId
        }

        const findConversationLimit = await this.modelMessage.find({ $and: [_query, { $or: [{ senderId: senderId }, { receivedId: senderId }] }] }).sort({ receivedTime: -1 }).limit(pageSize)

        const arrConversationId = _.uniq(_.pluck(findConversationLimit, 'conversationId'), (id) => id.toString())

        const listData = await this.model.find({ _id: { $in: arrConversationId } }).populate({ path: 'messages' }).lean()

        const finalData = listData.map((el: any) => {
            el.conversationId = el._id
            return el
        })

        return {
            statusCode: 200,
            success: true,
            data: finalData
        }
    }

}