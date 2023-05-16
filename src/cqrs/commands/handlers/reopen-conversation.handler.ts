import { BadRequestException } from "@nestjs/common"
import { ICommandHandler, CommandHandler, CommandBus } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ConversationState, NotifyEventType, ParticipantType } from "../../../common/enums"
import { Conversation, ConversationDocument } from "src/schemas"
import { LoggingService } from "../../../providers/logging"
import { NotifyNewMessageToAgentCommand } from "../notify-new-message-to-agent.command"
import { ReopenConversationCommand } from "../reopen-conversation.command"

@CommandHandler(ReopenConversationCommand)
export class ReopenConversationCommandHandler implements ICommandHandler<ReopenConversationCommand>{
    constructor(
        @InjectModel(Conversation.name)
        private readonly model: Model<ConversationDocument>,
        private readonly loggingService: LoggingService,
        private readonly commandBus: CommandBus
    ) { }

    async execute(body) {
        await this.loggingService.debug(ReopenConversationCommandHandler, `Data receive is: ${JSON.stringify(body.body)}`)
        const { referenceId, cloudAgentId } = body.body
        const findConversation = await this.model.findById(referenceId).lean()
        if (!findConversation) throw new BadRequestException("Not find conversation !")
        const conversationUpdated = await this.model.findByIdAndUpdate(referenceId, {
            conversationState: ConversationState.INTERACTIVE
        }, { new: true }).lean()
        const rooms = [`${cloudAgentId}_${findConversation.cloudTenantId}_${findConversation.applicationId}`]
        conversationUpdated['referenceId'] = conversationUpdated._id
        conversationUpdated['agentInitConv'] = cloudAgentId
        conversationUpdated['agentStartOutbound'] = cloudAgentId
        conversationUpdated['referenceId'] = conversationUpdated._id
        // notify to agent
        await this.commandBus.execute(
            new NotifyNewMessageToAgentCommand(
                ParticipantType.AGENT,
                NotifyEventType.NEW_CONVERSATION,
                rooms.join(','),
                {
                    message: conversationUpdated,
                },
            ),
        )
        return {
            statusCode: 200,
            success: true,
            data: conversationUpdated
        }
    }

}