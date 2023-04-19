import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseObject } from '../common/base/base-object';
import { v4 as uuidv4 } from 'uuid';

export type ParticipantDocument = Participant & Document;

@Schema({ collection: 'participant' })
export class Participant extends BaseObject<Participant> {
  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  _id: string;
  @Prop()
  participantType: string;
  @Prop()
  tenantId: string;
  @Prop()
  cloudTenantId: number;
  @Prop()
  cloudAgentId: number;
  @Prop()
  bot: string;
  @Prop()
  fullName: string;
  @Prop()
  username: string;
  @Prop()
  socketId: string;
  @Prop()
  numOfConversations: number;
  @Prop()
  maxNumOfConversations: number;
  @Prop()
  conversations: string[];
  @Prop()
  lastUpdateVersion: number;
}
export const ParticipantSchema = SchemaFactory.createForClass(Participant);
