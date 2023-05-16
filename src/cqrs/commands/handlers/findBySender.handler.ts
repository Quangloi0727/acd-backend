import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Conversation, ConversationDocument } from "../../../schemas"
import { LoggingService } from "../../../providers/logging"
import { FindBySenderCommand } from "../findBySender.command"

@CommandHandler(FindBySenderCommand)
export class FindBySenderCommandHandler implements ICommandHandler<FindBySenderCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        private readonly loggingService: LoggingService
    ) { }

    async execute(body) {
        const data = body.body
        await this.loggingService.debug(FindBySenderCommandHandler, `Data receive is: ${JSON.stringify(data)}`)
        const { applicationId, cloudTenantId, pageSize, senderId } = data

        const _query: any = {
            applicationId,
            cloudTenantId,
            senderId
        }

        const listData = await this.model.find(_query).limit(pageSize).populate({ path: 'messages' }).lean()

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