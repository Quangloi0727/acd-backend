import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConversation, EmailConversationDocument } from '../../../schemas';
import { ObjectId } from 'mongodb';
import { MarkEmailAsReadCommand } from '../mark-email-as-read.command';
import { LoggingService } from '../../../providers/logging';
import { EventPublisherCommand } from '../event-publisher.command';
import { KAFKA_TOPIC_MONITOR } from '../../../common/enums';

@CommandHandler(MarkEmailAsReadCommand)
export class MarkEmailAsReadCommandHandler
  implements ICommandHandler<MarkEmailAsReadCommand, any>
{
  constructor(
    private readonly loggingService: LoggingService,
    @InjectModel(EmailConversation.name)
    private readonly model: Model<EmailConversationDocument>,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: MarkEmailAsReadCommand): Promise<any> {
    await this.loggingService.debug(
      MarkEmailAsReadCommandHandler,
      `MarkEmailAsReadCommandHandler request: ${JSON.stringify(
        command.request,
      )}`,
    );
    await this.commandBus.execute(
      new EventPublisherCommand(
        KAFKA_TOPIC_MONITOR.EMAIL_READ,
        command.request,
      ),
    );
    return await this.model.updateOne(
      {
        _id: new ObjectId(command.request.conversationId),
      },
      {
        $set: {
          Readed: true,
          Reader: command.request.agentId,
          ReadedTime: new Date(),
        },
      },
    );
  }
}
