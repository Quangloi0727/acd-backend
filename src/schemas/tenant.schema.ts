import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseObject } from '../common/base/base-object';
import { v4 as uuidv4 } from 'uuid';

export type TenantDocument = Tenant & Document;

@Schema({ collection: 'tenant' })
export class Tenant extends BaseObject<Tenant> {
  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  _id: string;
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
