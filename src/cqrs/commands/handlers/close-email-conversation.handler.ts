import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CloseEmailConversationCommand } from "../close-email-conversation.command";
import { LoggingService } from "../../../providers/logging";
import { InjectModel } from "@nestjs/mongoose";
import { EmailConversation, EmailConversationDocument } from "../../../schemas";
import { Model } from "mongoose";

@CommandHandler(CloseEmailConversationCommand)
export class CloseEmailConversationCommandHandler implements ICommandHandler<CloseEmailConversationCommand> {
  constructor(
    private readonly loggingService: LoggingService,
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,) {}

  async execute(command: CloseEmailConversationCommand): Promise<any> {
    await this.loggingService.debug(
      CloseEmailConversationCommandHandler,
      `CloseEmailConversationCommand request: ${JSON.stringify(
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
        $set: { IsClosed: true, ClosedByAgent: command.body.agentId, ClosedDate: new Date() },
      },
    );
  }
}
