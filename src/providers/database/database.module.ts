import { Module } from '@nestjs/common';
import { DatabaseConfigModule, DatabaseConfigService } from '../../configs';
import { LoggingModule, LoggingService } from '../logging';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [DatabaseConfigModule, LoggingModule],
      inject: [DatabaseConfigService, LoggingService],
      useFactory: async (
        databaseConfig: DatabaseConfigService,
        logger: LoggingService,
      ) => {
        await logger.debug(
          DatabaseModule,
          `Connecting to database... with url: ${databaseConfig.url}`,
        );
        return {
          uri: databaseConfig.url,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
