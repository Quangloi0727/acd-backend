import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { ObjectId } from 'mongodb';
import { MarkEmailAsSpamCommand } from '../mark-email-as-spam.command';
import { LoggingService } from '../../../providers/logging';

@CommandHandler(MarkEmailAsSpamCommand)
export class MarkEmailAsSpamCommandHandler
  implements ICommandHandler<MarkEmailAsSpamCommand, any>
{
  constructor(
    private readonly loggingService: LoggingService,
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
  ) {}

  async execute(command: MarkEmailAsSpamCommand): Promise<any> {
    await this.loggingService.debug(
      MarkEmailAsSpamCommandHandler,
      `MarkEmailAsSpamCommandHandler request: ${JSON.stringify(
        command.request,
      )}`,
    );
    return await this.model.updateOne(
      {
        _id: new ObjectId(command.request.conversationId),
      },
      {
        $set: {
          SpamMarked: command.isSpam,
        },
      },
    );
  }
}
