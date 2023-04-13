import { Module } from '@nestjs/common';
import { KafkaConfigModule, KafkaConfigService } from '../../configs';
import { KafkaModule } from './kafka.module';
import { KafkaResponseDeserializer } from './deserializer/kafka-response.deserializer';
import { KafkaRequestSerializer } from './serializer/kafka-request.serializer';
import { KafkaModuleOption } from './interfaces';

export const KafkaClientService = 'KAFKA_SERVICE';

@Module({
  imports: [
    KafkaModule.registerAsync([KafkaClientService], {
      useFactory: async (config: KafkaConfigService) => [
        {
          name: KafkaClientService,
          options: {
            client: {
              brokers: [config.broker],
              connectionTimeout: config.connection_timeout,
              authenticationTimeout: config.authentication_timeout,
              reauthenticationThreshold: config.reauthentication_timeout,
              autoConnect: true,
              requestTimeout: config.transaction_timeout,
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
            deserializer: new KafkaResponseDeserializer(),
            serializer: new KafkaRequestSerializer(),
          },
        } as KafkaModuleOption,
      ],
      inject: [KafkaConfigService],
      imports: [KafkaConfigModule],
    }),
  ],
})
export class KafkaProviderModule {}
