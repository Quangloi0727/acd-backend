import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FacadeRestApiController } from './facade-rest-api.controller';
import { AcdCqrsModule } from '../cqrs/acd-cqrs.module';

@Module({
  imports: [CqrsModule, AcdCqrsModule],
  controllers: [FacadeRestApiController],
})
export class FacadeRestApiModule {}
