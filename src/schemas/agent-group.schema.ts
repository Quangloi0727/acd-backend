import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentGroupDocument = AgentGroup & Document;

@Schema({ timestamps: true })
export class AgentGroup {
  @Prop({ index: true, required: true })
  channelType: string;

  @Prop()
  description: string;

  @Prop()
  groupName: string;

  @Prop()
  supervisorId: number;

  @Prop({ index: true })
  tenantId: number;

  @Prop()
  listTenantSettingId: number[];

  @Prop({ index: true })
  attachments: string[];

  @Prop({ index: true })
  idAgentGroupInCrm: number;

  @Prop({ index: true, default: false })
  isDeleted: boolean;

  @Prop({ index: true })
  agentIds: number[];
}

export const AgentGroupSchema = SchemaFactory.createForClass(AgentGroup);
