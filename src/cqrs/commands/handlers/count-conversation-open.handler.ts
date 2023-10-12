import { ICommandHandler, CommandHandler, CommandBus } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ConversationState } from "../../../common/enums"
import { Conversation, ConversationDocument } from "../../../schemas"
import { LoggingService } from "../../../providers/logging"
import { CountConversationOpenCommand } from "../count-conversation-open.command"

@CommandHandler(CountConversationOpenCommand)
export class CountConversationOpenCommandHandler implements ICommandHandler<CountConversationOpenCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        private readonly loggingService: LoggingService
    ) { }

    async execute(body) {
        await this.loggingService.debug(CountConversationOpenCommandHandler, `Data receive is: ${JSON.stringify(body.body)}`)
        const { supportApplicationIds, tenantId, agentId } = body.body
        const _query: any = {
            applicationId: { $in: supportApplicationIds },
            cloudTenantId: tenantId
        }
        const Open = this.model.aggregate([
            { $match: { ..._query, conversationState: ConversationState.OPEN } },
            {
                $count: "totalCount"
            }
        ])

        const Interactive = this.model.aggregate([
            { $match: { ..._query, agentPicked: agentId, conversationState: ConversationState.INTERACTIVE } },
            {
                $count: "totalCount"
            }
        ])

        const [totalOpen, totalInteractive] = await Promise.all([Open, Interactive])
        
        return {
            statusCode: 200,
            success: true,
            dataOpen: totalOpen[0]?.totalCount || 0,
            dataInteractive: totalInteractive[0]?.totalCount || 0
        }
    }

}