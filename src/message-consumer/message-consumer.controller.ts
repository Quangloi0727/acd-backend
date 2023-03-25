import { Controller, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller()
export class MessageConsumerController {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly client: ClientKafka,
  ) {
    client.connect();
  }
}
