import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggingService } from '../../../providers/logging';
import { EventPublisherCommand } from '../event-publisher.command';
import { KafkaClientService, KafkaService } from '../../../providers/kafka';

@CommandHandler(EventPublisherCommand)
export class EventPublisherCommandHandler
  implements ICommandHandler<EventPublisherCommand, boolean>
{
  constructor(
    private readonly logger: LoggingService,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
  ) {}
  async execute(command: EventPublisherCommand): Promise<boolean> {
    this.logger.debug(
      EventPublisherCommandHandler,
      `event publisher to topic: ${command.topic}`,
    );
    try {
      await this.kafkaService.send(command.data, command.topic);
      return true;
    } catch (e) {
      await this.logger.error(
        EventPublisherCommandHandler,
        `error: ${e.message}`,
      );
      return false;
    }
  }
}
