import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggingService } from '../../../providers/logging';
import { FireKafkaEventCommand } from '../fire-kafka-event.command';
import { Inject } from '@nestjs/common';
import { KafkaClientService, KafkaService } from '../../../providers/kafka';

@CommandHandler(FireKafkaEventCommand)
export class FireKafkaEventCommandHandler
  implements ICommandHandler<FireKafkaEventCommand>
{
  constructor(
    private readonly logger: LoggingService,
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
  ) {}
  async execute(command: FireKafkaEventCommand): Promise<any> {
    this.logger.debug(
      FireKafkaEventCommandHandler,
      `notify request: ${JSON.stringify(command.data)}`,
    );
    await this.kafkaService.send(command.data, command.eventType);
    return {
      statusCode: 200,
      success: true,
    };
  }
}
