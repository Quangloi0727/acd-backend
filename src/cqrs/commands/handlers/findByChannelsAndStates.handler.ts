import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Conversation, ConversationDocument } from "../../../schemas"
import { FindByChannelsAndStatesCommand } from "../findByChannelsAndStates.command"
import { LoggingService } from "../../../providers/logging"
import { ConversationState } from "../../../common/enums"

@CommandHandler(FindByChannelsAndStatesCommand)
export class FindByChannelsAndStatesCommandHandler implements ICommandHandler<FindByChannelsAndStatesCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        private readonly loggingService: LoggingService
    ) { }

    async execute(body) {
        const data = body.body
        await this.loggingService.debug(FindByChannelsAndStatesCommandHandler, `Data receive is: ${JSON.stringify(data)}`)
        const { applicationIds, channels, cloudAgentId, cloudTenantId, conversationStates, currentPage, pageSize } = data
        const skip = (currentPage - 1) * pageSize
        const _query: any = {
            applicationId: { $in: applicationIds },
            channel: { $in: channels },
            cloudTenantId,
            conversationState: { $in: conversationStates },
        }

        if (cloudAgentId && conversationStates.includes(ConversationState.CLOSE) == false) _query.agentPicked = cloudAgentId

        const list = this.model.aggregate([
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
                    startedTime: { $last: "$startedTime" }
                }
            },
            { $match: _query },
            { $sort: { "startedTime": -1 } },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: "message",
                    localField: "lastMessage",
                    foreignField: "_id",
                    as: "lastMessage"
                }
            },
            { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
            { $sort: { "lastMessage.receivedTime": -1 } }
        ])

        const total = this.model.aggregate([
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
                    agentPicked: { $last: "$agentPicked" }
                }
            },
            { $match: _query },
            {
                $count: "totalCount"
            }
        ])
        
        const [listData, totalData] = await Promise.all([list, total])

        return {
            statusCode: 200,
            success: true,
            data: {
                totalRecords: totalData[0]?.totalCount || 0,
                currentPage,
                pageSize,
                data: listData
            }
        }
    }

}