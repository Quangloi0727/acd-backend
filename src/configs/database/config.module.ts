import { Module } from '@nestjs/common';

import { CommonConfigModule } from '../config.module';
import { DatabaseConfigService } from './config.service';

@Module({
  imports: [CommonConfigModule],
  providers: [DatabaseConfigService],
  exports: [DatabaseConfigService],
})
export class DatabaseConfigModule {}
