import { Module } from '@nestjs/common';
import { CommonConfigModule } from '../config.module';
import { KafkaConfigService } from './config.service';

@Module({
  imports: [CommonConfigModule],
  providers: [KafkaConfigService],
  exports: [KafkaConfigService],
})
export class KafkaConfigModule {}
