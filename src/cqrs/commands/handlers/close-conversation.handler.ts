import { ICommandHandler, CommandHandler, CommandBus } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ConversationState, KAFKA_TOPIC_MONITOR, NotifyEventType, ParticipantType } from "../../../common/enums"
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
        const findConversation = await this.model.findById(conversationId).lean()
        if (!findConversation) throw new BadRequestException("Not find conversation !")
        const conversationUpdated = await this.model.findByIdAndUpdate(conversationId, {
            conversationState: ConversationState.CLOSE,
            closedTime: new Date()
        }, { new: true }).lean()
        const rooms = [`${findConversation.cloudTenantId}_${findConversation.applicationId}`]
        const data: any = { ...conversationUpdated }
        data.event = NotifyEventType.CLOSE_CONVERSATION
        data.room = rooms.join(',')
        data.conversationId = conversationUpdated._id

        // send kafka event create new conversation
        await this.kafkaService.send(data, KAFKA_TOPIC_MONITOR.CONVERSATION_CLOSE)

        // notify to agent
        await this.commandBus.execute(
            new NotifyNewMessageToAgentCommand(
                ParticipantType.AGENT,
                NotifyEventType.CLOSE_CONVERSATION,
                rooms.join(','),
                data
            )
        )
        return {
            statusCode: 200,
            success: true
        }
    }

}