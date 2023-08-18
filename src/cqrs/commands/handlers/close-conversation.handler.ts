import { ICommandHandler, CommandHandler, CommandBus } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ChannelType, ConversationState, KAFKA_TOPIC_MONITOR, NotifyEventType, ParticipantType } from "../../../common/enums"
import { Conversation, ConversationDocument } from "../../../schemas"
import { LoggingService } from "../../../providers/logging"
import { NotifyNewMessageToAgentCommand } from "../notify-new-message-to-agent.command"
import { CloseConversationCommand } from "../close-conversation.command"
import { BadRequestException, Inject } from "@nestjs/common"
import { KafkaClientService, KafkaService } from "../../../providers/kafka"

@CommandHandler(CloseConversationCommand)
export class CloseConversationCommandHandler implements ICommandHandler<CloseConversationCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        private readonly loggingService: LoggingService,
        private readonly commandBus: CommandBus,
        @Inject(KafkaClientService)
        private kafkaService: KafkaService
    ) { }

    async execute(body) {
        await this.loggingService.debug(CloseConversationCommandHandler, `Data receive is: ${JSON.stringify(body.body)}`)
        const { conversationId } = body.body
        const findConversation = await this.model.findById(conversationId).lean().exec()
        if (!findConversation) throw new BadRequestException("Not find conversation !")
        const conversationUpdated = await this.model.findByIdAndUpdate(conversationId, {
            conversationState: ConversationState.CLOSE,
            closedTime: new Date()
        }, { new: true }).populate("lastMessage").lean().exec()
        const rooms = [`${findConversation.cloudTenantId}_${findConversation.applicationId}`]
        const data: any = { ...conversationUpdated }
        data.event = NotifyEventType.CLOSE_CONVERSATION
        data.room = rooms.join(',')
        data.conversationId = conversationUpdated._id

        // send kafka event close conversation
        await this.kafkaService.send(data, KAFKA_TOPIC_MONITOR.CONVERSATION_CLOSE)

        // send kafka event general report
        await this.kafkaService.send(this.generalReportConversation(conversationUpdated), KAFKA_TOPIC_MONITOR.CONVERSATION_GENERAL_REPORT)

        // notify to agent
        await this.commandBus.execute(
            new NotifyNewMessageToAgentCommand(
                ParticipantType.AGENT,
                NotifyEventType.CLOSE_CONVERSATION,
                rooms.join(','),
                data
            )
        )

        // import case if exist conversation have status different close update all before status to close
        const findListConver = await this.model.find({ 
            senderId: findConversation.senderId,
            applicationId:findConversation.applicationId,
            conversationState: { $ne: ConversationState.CLOSE } 
        }).lean().exec()

        if (!findConversation || !findListConver.length){
            return {
                statusCode: 200,
                success: true
            }
        }else{
            for (const el of findListConver){
                const conversationUpdatedImplement = await this.model.findByIdAndUpdate(el._id, {
                    conversationState: ConversationState.CLOSE,
                    closedTime: new Date()
                }, { new: true }).populate("lastMessage").lean().exec()
                const dataImplement: any = { ...conversationUpdatedImplement }
                dataImplement.event = NotifyEventType.CLOSE_CONVERSATION
                dataImplement.room = rooms.join(',')
                dataImplement.conversationId = conversationUpdatedImplement._id
                // send kafka event close conversation
                await this.kafkaService.send(dataImplement, KAFKA_TOPIC_MONITOR.CONVERSATION_CLOSE)
                // send kafka event general report
                await this.kafkaService.send(this.generalReportConversation(conversationUpdatedImplement), KAFKA_TOPIC_MONITOR.CONVERSATION_GENERAL_REPORT)
            }
            return {
                statusCode: 200,
                success: true
            }
        }

    }

    private generalReportConversation(conversation) {
        const { agentPicked, cloudTenantId, applicationId, applicationName, senderId, senderName, _id, messages, channel, startedBy, startedTime, conversationState } = conversation
        return {
            agentPicked,
            cloudTenantId,
            applicationId,
            applicationName,
            senderId,
            senderName,
            id: _id,
            NumOfMessages: messages.length,
            channel: this.convertChannelType(channel),
            startedBy,
            startedTime,
            conversationState: this.convertConversationSateType(conversationState)
        }
    }

    private convertChannelType(channel) {
        if (channel == ChannelType.ZL_MESSAGE) return 1
        if (channel == ChannelType.FB_MESSAGE) return 2
        if (channel == ChannelType.ZL_PAGE) return 3
        if (channel == ChannelType.FB_PAGE) return 4
        if (channel == ChannelType.LIVE_CHAT) return 5
        return 0
    }

    private convertConversationSateType(conversationState) {
        if (conversationState == ConversationState.OPEN) return 1
        if (conversationState == ConversationState.INTERACTIVE) return 2
        if (conversationState == ConversationState.NON_INTERACTIVE) return 3
        if (conversationState == ConversationState.CLOSE) return 4
        return 0
    }

}