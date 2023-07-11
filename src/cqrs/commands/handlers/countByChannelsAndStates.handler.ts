import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Conversation, ConversationDocument } from "../../../schemas"
import { CountByChannelsAndStatesCommand } from "../countByChannelsAndStates.command"
import { LoggingService } from "../../../providers/logging"
import { ConversationState } from "../../../common/enums"

@CommandHandler(CountByChannelsAndStatesCommand)
export class CountByChannelsAndStatesCommandHandler implements ICommandHandler<CountByChannelsAndStatesCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        private readonly loggingService: LoggingService
    ) { }

    async execute(body) {
        const data = body.body
        await this.loggingService.debug(CountByChannelsAndStatesCommandHandler, `Data receive is: ${JSON.stringify(data)}`)
        const { applicationIds, channels, cloudAgentId, cloudTenantId, conversationStates, currentPage, pageSize, filterText } = data
        const _query: any = {
            applicationId: { $in: applicationIds },
            channel: { $in: channels },
            cloudTenantId
        }
        const _queryImplement: any = {
            conversationState: { $in: conversationStates }
        }

        if (cloudAgentId && conversationStates.includes(ConversationState.CLOSE) == false) {
            _queryImplement.$or = []
            _queryImplement.$or.push({ participants: cloudAgentId }, { agentPicked: cloudAgentId })
        }

        const total = await this.model.aggregate([
            { $match: _query },
            { $sort: { startedTime: 1 } },
            {
                $group: {
                    _id: {
                        senderId: "$senderId",
                        applicationId: "$applicationId"
                    },
                    senderName: { $last: "$senderName" },
                    conversationId: { $last: "$_id" },
                    senderId: { $last: "$senderId" },
                    applicationId: { $last: "$applicationId" },
                    applicationName: { $last: "$applicationName" },
                    channel: { $last: "$channel" },
                    cloudTenantId: { $last: "$cloudTenantId" },
                    conversationState: { $last: "$conversationState" },
                    lastMessage: { $last: "$lastMessage" },
                    agentPicked: { $last: "$agentPicked" },
                    participants: { $last: "$participants" }
                }
            },
            { $match: _queryImplement },
            {
                $count: "totalCount"
            }
        ])
        
        return {
            statusCode: 200,
            success: true,
            data: {
                totalRecords: total[0]?.totalCount || 0
            }
        }
    }


}