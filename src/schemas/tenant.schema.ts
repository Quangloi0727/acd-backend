import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseObject } from '../common/base/base-object';
import mongoose, { Document } from 'mongoose';

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

  @Prop({ type: Object })
  configs: {
    _id: {
      type: mongoose.Schema.Types.ObjectId;
      index: true;
      required: true;
      auto: true;
    };
    applicationId: string;
    applicationName: string;
    pageAccessToken: string;
    channel: string;
    pageRefreshToken: string;
    secretKey: string;
    clientId: string;
  };

  @Prop()
  lastUpdateVersion: number;
}
export const TenantSchema = SchemaFactory.createForClass(Tenant);
