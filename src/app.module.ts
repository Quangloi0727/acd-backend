import { Module } from '@nestjs/common';
import { CommonConfigModule } from './configs/config.module';
import { DatabaseModule } from './providers/database/database.module';
import { ChatSessionManagerModule } from './chat-session-manager';
import { ChatSessionRegistryModule } from './chat-session-registry';
import { ChatSessionTrackerModule } from './chat-session-tracker';
import { MessageConsumerModule } from './message-consumer';
import { KafkaProviderModule } from './providers/kafka/provider.module';
import { FacadeRestApiModule } from './facade-rest-api';

@Module({
  imports: [
    CommonConfigModule,
    DatabaseModule,
    KafkaProviderModule,
    MessageConsumerModule,
    ChatSessionManagerModule,
    ChatSessionRegistryModule,
    ChatSessionTrackerModule,
    FacadeRestApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
