import { Module } from '@nestjs/common';
import {
  ClientProvider,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { KafkaConfigModule } from '../../configs/kafka/config.module';
import { KafkaConfigService } from '../../configs/kafka/config.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        useFactory: async (config: KafkaConfigService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                brokers: [config.broker],
                connectionTimeout: config.connection_timeout,
                authenticationTimeout: config.authentication_timeout,
                reauthenticationThreshold: config.reauthentication_timeout,
                autoConnect: true,
                consumeFromBeginning: true,
                sasl: config.sasl_enable
                  ? {
                      mechanism: config.mechanism,
                      username: config.username,
                      password: config.password,
                    }
                  : null,
              },
              producer: {
                allowAutoTopicCreation: true,
                transactionTimeout: config.transaction_timeout,
              },
              consumer: {
                allowAutoTopicCreation: true,
                groupId: config.group_id,
                consumeFromBeginning: true,
              },
              responseDefaultTimeout: config.response_timeout,
            },
          } as ClientProvider;
        },
        inject: [KafkaConfigService],
        imports: [KafkaConfigModule],
      },
    ]),
  ],
})
export class KafkaModule {}
