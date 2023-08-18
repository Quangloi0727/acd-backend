import { BadRequestException, Inject } from "@nestjs/common"
import { ICommandHandler, CommandHandler, CommandBus } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ConversationState, KAFKA_TOPIC_MONITOR, NotifyEventType, ParticipantType } from "../../../common/enums"
import { Conversation, ConversationDocument } from "../../../schemas"
import { PickConversationCommand } from "../pick-conversation.command"
import { LoggingService } from "../../../providers/logging"
import { NotifyNewMessageToAgentCommand } from "../notify-new-message-to-agent.command"
import { KafkaClientService, KafkaService } from "../../../providers/kafka"

@CommandHandler(PickConversationCommand)
export class PickConversationCommandHandler implements ICommandHandler<PickConversationCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        @Inject(KafkaClientService)
        private kafkaService: KafkaService,
        private readonly loggingService: LoggingService,
        private readonly commandBus: CommandBus
    ) { }

    async execute(body) {
        await this.loggingService.debug(PickConversationCommandHandler, `Data receive is: ${JSON.stringify(body.body)}`)
        const { cloudAgentId, conversationId } = body.body
        const findConversation = await this.model.findById(conversationId).lean().exec()
        if (!findConversation) throw new BadRequestException("Not find conversation !")
        if (findConversation.conversationState != ConversationState.OPEN) throw new BadRequestException("Conversation has been received !")
        const conversationUpdated = await this.model.findByIdAndUpdate(conversationId, {
            agentPicked: cloudAgentId,
            conversationState: ConversationState.INTERACTIVE,
            $push: { participants: cloudAgentId },
            pickConversationTime:new Date(),
            lastTime:new Date(),
        }, { new: true }).lean().exec()
        const rooms = [`${findConversation.cloudTenantId}_${findConversation.applicationId}`]
        const data: any = { ...conversationUpdated }
        data.event = NotifyEventType.PICK_CONVERSATION
        data.room = rooms.join(',')
        data.conversationId = conversationUpdated._id
        data.pickedBy = conversationUpdated.agentPicked

        // send kafka event create new conversation
        await this.kafkaService.send(data, KAFKA_TOPIC_MONITOR.CONVERSATION_PICK)

        // notify to agent
        await this.commandBus.execute(
            new NotifyNewMessageToAgentCommand(
                ParticipantType.AGENT,
                NotifyEventType.PICK_CONVERSATION,
                rooms.join(','),
                data
            ),
        )
        return {
            statusCode: 200,
            success: true
        }
    }

}