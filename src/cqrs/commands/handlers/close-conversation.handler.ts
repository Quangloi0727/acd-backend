import { ICommandHandler, CommandHandler, CommandBus } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ConversationState, NotifyEventType, ParticipantType } from "../../../common/enums"
import { Conversation, ConversationDocument } from "src/schemas"
import { LoggingService } from "../../../providers/logging"
import { NotifyNewMessageToAgentCommand } from "../notify-new-message-to-agent.command"
import { CloseConversationCommand } from "../close-conversation.command"
import { BadRequestException } from "@nestjs/common"

@CommandHandler(CloseConversationCommand)
export class CloseConversationCommandHandler implements ICommandHandler<CloseConversationCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        private readonly loggingService: LoggingService,
        private readonly commandBus: CommandBus
    ) { }

    async execute(body) {
        await this.loggingService.debug(CloseConversationCommandHandler, `Data receive is: ${JSON.stringify(body.body)}`)
        const { cloudAgentId, conversationId } = body.body
        const findConversation = await this.model.findById(conversationId).lean()
        if (!findConversation) throw new BadRequestException("Not find conversation !")
        const conversationUpdated = await this.model.findByIdAndUpdate(conversationId, {
            conversationState: ConversationState.CLOSE,
            closedTime: new Date()
        }, { new: true }).lean()
        const rooms = [`${cloudAgentId}_${findConversation.cloudTenantId}_${findConversation.applicationId}`]
        const data: any = { ...conversationUpdated }
        data.event = NotifyEventType.CLOSE_CONVERSATION
        data.room = rooms.join(',')
        data.conversationId = conversationUpdated._id
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