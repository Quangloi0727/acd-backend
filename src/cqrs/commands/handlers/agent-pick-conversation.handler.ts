import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoggingService } from "../../../providers/logging";
import { InjectModel } from "@nestjs/mongoose";
import { EmailConversation, EmailConversationDocument } from "../../../schemas";
import { Model } from "mongoose";
import { AgentPickConversationCommand } from "../agent-pick-conversation.command";

@CommandHandler(AgentPickConversationCommand)
export class AgentPickConversationCommandHandler
  implements ICommandHandler<AgentPickConversationCommand> {
  constructor(
    private readonly loggingService: LoggingService,
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: AgentPickConversationCommand) {
    await this.loggingService.debug(
      AgentPickConversationCommandHandler,
      `AssignAgentToConversationCommandHandler request: ${JSON.stringify(
        command,
      )}`,
    );
    return this.model.updateOne(
      {
        _id: {
          $eq: command.body.emailId
        },
      },
      {
        $set: { AgentId: command.body.agentId, AssignedDate: new Date() },
      },
    );
  }
}
