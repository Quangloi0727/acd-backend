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
        const { applicationIds, channels, cloudAgentId, cloudTenantId, conversationStates, currentPage, pageSize, filterText } = data
        const skip = (currentPage - 1) * pageSize
        const _query: any = {
            applicationId: { $in: applicationIds },
            channel: { $in: channels },
            cloudTenantId
        }
        const _queryImplement: any = {
            conversationState: { $in: conversationStates }
        }

        if (filterText && filterText != "") {
            _query.senderName = { $regex: new RegExp(this.stringRegex(filterText), 'i') }
        }

        if (cloudAgentId && conversationStates.includes(ConversationState.CLOSE) == false) {
            _queryImplement.$or = []
            _queryImplement.$or.push({ participants: cloudAgentId }, { agentPicked: cloudAgentId })
        }

        const list = this.model.aggregate([
            { $match: _query },
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
                    startedTime: { $last: "$startedTime" },
                    participants: { $last: "$participants" }
                }
            },
            { $match: _queryImplement },
            { $sort: { startedTime: -1 } },
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
            { $match: _query },
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


    private stringRegex(text) {
        let txt = text
            .toLowerCase()
            .replace(/^(\s*)|(\s*)$/g, '')
            .replace(/\s+/g, ' ')

        let ss = ''

        function isValidCharacter(str) {
            return !/[~`!#$%\^&*+=\-\[\]\\';,/{}()|\\":<>\?]/g.test(str)
        }

        for (let i = 0; i < txt.length; i++) {
            ss = isValidCharacter(txt[i]) ? ss.concat(txt[i]) : ss.concat('\\', txt[i])
        }
        txt = ss

        const a = 'àáảãạâầấẩẫậăằắẳẵặa'
        const d = 'đd'
        const u = 'ùúủũụưừứửữựu'
        const i = 'ìíỉĩịi'
        const e = 'èéẻẽẹêềếểễệe'
        const o = 'òóỏõọôồốổỗộơờớởỡợo'
        const y = 'ỳýỷỹỵy'
        let str = ''
        for (let k = 0; k < txt.length; k++) {
            if (a.includes(txt[k])) {
                str = str + '[' + a + ']'
            }
            else if (d.includes(txt[k])) {
                str = str + '[' + d + ']'
            }
            else if (u.includes(txt[k])) {
                str = str + '[' + u + ']'
            }
            else if (i.includes(txt[k])) {
                str = str + '[' + i + ']'
            }
            else if (e.includes(txt[k])) {
                str = str + '[' + e + ']'
            }
            else if (o.includes(txt[k])) {
                str = str + '[' + o + ']'
            }
            else if (y.includes(txt[k])) {
                str = str + '[' + y + ']'
            }
            else {
                str = str + txt[k]
            }
        }
        return str
    }

}