import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ComponentStatus } from '../../components/entities/component.entity';
import { IncidentStatus } from './incident.entity';

export enum IncidentUpdateType {
  CREATED = 'created',
  UPDATED = 'updated',
  CLOSED = 'closed',
}

@Schema({
  collection: 'incident_updates',
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class IncidentUpdate extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Incident', required: true })
  incidentId: Types.ObjectId;

  @Prop({ required: false })
  description: string;

  @Prop({
    type: String,
    enum: IncidentUpdateType,
    required: true,
  })
  type: IncidentUpdateType;

  @Prop({
    type: {
      from: {
        type: String,
        enum: Object.values(IncidentStatus),
        required: false,
      },
      to: {
        type: String,
        enum: Object.values(IncidentStatus),
        required: true,
      },
    },
    required: false,
  })
  statusUpdate?: {
    from: IncidentStatus | null;
    to: IncidentStatus;
  };

  @Prop({
    type: [
      {
        id: { type: String, required: true },
        from: { type: String, required: true },
        to: { type: String, required: true },
      },
    ],
    required: false,
  })
  componentStatusUpdates?: {
    id: string;
    from: ComponentStatus;
    to: ComponentStatus;
  }[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const IncidentUpdateSchema = SchemaFactory.createForClass(IncidentUpdate);
