import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseObject } from '../common/base/base-object';

export type TenantDocument = Tenant & Document;

@Schema({ collection: 'tenant' })
export class Tenant extends BaseObject<Tenant> {
  @Prop()
  name: string;
  @Prop()
  cloudTenantId: number;
  @Prop()
  cacheValidInMinutes: string;
  @Prop()
  config: object[];
  @Prop()
  applicationIds: string[];
  @Prop()
  lastUpdateVersion: number;
}
export const TenantSchema = SchemaFactory.createForClass(Tenant);
