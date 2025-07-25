import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  Component,
  ComponentStatus,
} from '../../components/entities/component.entity';

export enum IncidentStatus {
  INVESTIGATING = 'investigating',
  IDENTIFIED = 'identified',
  MONITORING = 'monitoring',
  RESOLVED = 'resolved',
}

export enum IncidentImpact {
  NONE = 'none',
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

@Schema({
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
export class Incident extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: IncidentStatus,
    default: IncidentStatus.INVESTIGATING,
  })
  status: IncidentStatus;

  @Prop({
    type: String,
    enum: IncidentImpact,
    default: IncidentImpact.MINOR,
  })
  impact: IncidentImpact;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Component' }] })
  affectedComponents: Component[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);
