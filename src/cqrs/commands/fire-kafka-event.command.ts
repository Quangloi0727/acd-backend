import { ICommand } from '@nestjs/cqrs';
import { KAFKA_TOPIC_MONITOR } from '../../common/enums';

export class FireKafkaEventCommand implements ICommand {
  constructor(public eventType: KAFKA_TOPIC_MONITOR, public data: any) {}
}
