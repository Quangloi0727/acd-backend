import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DatabaseConfigModule } from '../../configs/database/config.module';
import { DatabaseConfigService } from '../../configs/database/config.service';
import { DatabaseType } from 'typeorm';
import { LoggingModule } from '../logging/logging.module';
import { LoggingService } from '../logging/logging.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DatabaseConfigModule, LoggingModule],
      inject: [DatabaseConfigService, LoggingService],
      useFactory: async (
        databaseConfig: DatabaseConfigService,
        logger: LoggingService,
      ) => {
        await logger.debug(
          'DatabaseModule',
          `Connecting to database... with url: ${databaseConfig.url}`,
        );
        return {
          type: databaseConfig.type as DatabaseType,
          url: databaseConfig.url,
          entities: [],
          migrations: await databaseConfig.migrations(),
          migrationsRun: false,
          extra: {
            trustServerCertificate: true,
          },
          autoLoadEntities: true,
        } as TypeOrmModuleAsyncOptions;
      },
    }),
  ],
})
export class DatabaseModule {}
