import { Module } from '@nestjs/common';
import { CommonConfigModule } from './configs/config.module';
import { DatabaseModule } from './providers/database/database.module';
import { MessageConsumerModule } from './message-consumer';
import { KafkaProviderModule } from './providers/kafka/provider.module';
import { FacadeRestApiModule } from './facade-rest-api';

@Module({
  imports: [
    CommonConfigModule,
    DatabaseModule,
    KafkaProviderModule,
    MessageConsumerModule,
    FacadeRestApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
