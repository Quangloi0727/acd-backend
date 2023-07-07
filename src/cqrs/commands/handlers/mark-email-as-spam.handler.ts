import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailConversation,
  EmailConversationDocument,
  EmailSpam,
  EmailSpamDocument,
} from '../../../schemas';
import { ObjectId } from 'mongodb';
import { MarkEmailAsSpamCommand } from '../mark-email-as-spam.command';
import { LoggingService } from '../../../providers/logging';
import { EventPublisherCommand } from '../event-publisher.command';
import { KAFKA_TOPIC_MONITOR } from '../../../common/enums';

@CommandHandler(MarkEmailAsSpamCommand)
export class MarkEmailAsSpamCommandHandler
  implements ICommandHandler<MarkEmailAsSpamCommand, any>
{
  constructor(
    private readonly loggingService: LoggingService,
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
    @InjectModel(EmailSpam.name)
    private readonly emailSpamModel: Model<EmailSpamDocument>,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: MarkEmailAsSpamCommand): Promise<any> {
    await this.loggingService.debug(
      MarkEmailAsSpamCommandHandler,
      `MarkEmailAsSpamCommandHandler request: ${JSON.stringify(
        command.request,
      )}`,
    );

    const conversation = await this.model
      .findById(new ObjectId(command.request.conversationId))
      .exec();

    if (!conversation) return null;

    if (command.isSpam == true) {
      let email_spam = await this.emailSpamModel
        .findOne({
          TenantId: conversation.TenantId,
          Email: conversation.FromEmail,
        })
        .exec();
      if (!email_spam) {
        email_spam = await this.emailSpamModel.create({
          TenantId: conversation.TenantId,
          Email: conversation.FromEmail,
        });
        await email_spam.save();
      }
      await this.commandBus.execute(
        new EventPublisherCommand(
          KAFKA_TOPIC_MONITOR.EMAIL_SPAM_MARKED,
          command.request,
        ),
      );
    } else {
      await this.emailSpamModel.deleteMany({
        TenantId: conversation.TenantId,
        Email: conversation.FromEmail,
      });
      await this.commandBus.execute(
        new EventPublisherCommand(
          KAFKA_TOPIC_MONITOR.EMAIL_SPAM_UNMARKED,
          command.request,
        ),
      );
    }

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
