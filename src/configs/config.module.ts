import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CommonConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        (process.env.NODE_ENV === 'development' && '.env.dev') || '.env',
    }),
  ],
  providers: [ConfigService, CommonConfigService],
  exports: [ConfigService, CommonConfigService],
})
export class CommonConfigModule {}
