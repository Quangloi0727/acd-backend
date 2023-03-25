import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from './providers/logging/logging.module';
import { ChatSessionManagerModule } from './chat-session-manager/chat-session-manager.module';
import { ChatSessionRegistryModule } from './chat-session-registry/chat-session-registry.module';
import { ChatSessionTrackerModule } from './chat-session-tracker/chat-session-tracker.module';
import { MessageConsumerModule } from './message-consumer/message-consumer.module';
import { DatabaseModule } from './providers/database/database.module';
import { KafkaModule } from './providers/kafka/kafka.module';

@Module({
  imports: [
    LoggingModule,
    DatabaseModule,
    KafkaModule,
    MessageConsumerModule,
    ChatSessionManagerModule,
    ChatSessionRegistryModule,
    ChatSessionTrackerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
