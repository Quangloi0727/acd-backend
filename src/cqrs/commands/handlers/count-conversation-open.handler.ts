import { BadRequestException } from "@nestjs/common"
import { ICommandHandler, CommandHandler, CommandBus } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ConversationState, NotifyEventType, ParticipantType } from "../../../common/enums"
import { Conversation, ConversationDocument } from "src/schemas"
import { LoggingService } from "../../../providers/logging"
import { NotifyNewMessageToAgentCommand } from "../notify-new-message-to-agent.command"
import { CountConversationOpenCommand } from "../count-conversation-open.command"

@CommandHandler(CountConversationOpenCommand)
export class CountConversationOpenCommandHandler implements ICommandHandler<CountConversationOpenCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        private readonly loggingService: LoggingService,
        private readonly commandBus: CommandBus
    ) { }

    async execute(body) {
        await this.loggingService.debug(CountConversationOpenCommandHandler, `Data receive is: ${JSON.stringify(body.body)}`)
        const { supportApplicationIds, tenantId, agentId } = body.body
        const _query: any = {
            applicationId: { $in: supportApplicationIds },
            cloudTenantId: tenantId
        }
        const totalOpen = await this.model.aggregate([
            {
                $group: {
                    _id: {
                        senderId: "$senderId",
                        applicationId: "$applicationId"
                    },
                    channel: { $last: "$channel" },
                    cloudTenantId: { $last: "$cloudTenantId" },
                    applicationId: { $last: "$applicationId" },
                    conversationState: { $last: "$conversationState" }
                }
            },
            { $match: { ..._query, conversationState: ConversationState.OPEN } },
            {
                $count: "totalCount"
            }
        ])

        const totalInteractive = await this.model.aggregate([
            {
                $group: {
                    _id: {
                        senderId: "$senderId",
                        applicationId: "$applicationId"
                    },
                    channel: { $last: "$channel" },
                    cloudTenantId: { $last: "$cloudTenantId" },
                    applicationId: { $last: "$applicationId" },
                    conversationState: { $last: "$conversationState" },
                    agentPicked: { $last: "$agentPicked" }
                }
            },
            { $match: { ..._query, agentPicked: agentId, conversationState: ConversationState.INTERACTIVE } },
            {
                $count: "totalCount"
            }
        ])

        return {
            statusCode: 200,
            success: true,
            dataOpen: totalOpen[0]?.totalCount || 0,
            dataInteractive: totalInteractive[0]?.totalCount || 0
        }
    }

}