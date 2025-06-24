import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Component } from '../../components/entities/component.entity';

export enum IncidentStatus {
  INVESTIGATING = 'investigating',
  IDENTIFIED = 'identified',
  MONITORING = 'monitoring',
  RESOLVED = 'resolved',
}

export enum IncidentImpact {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

export interface StatusChange {
  from: IncidentStatus | null;
  to: IncidentStatus;
}

export interface ComponentStatusChange {
  componentId: string;
  from: string;
  to: string;
}

export interface IncidentUpdate {
  message: string;
  statusUpdate?: StatusChange;
  componentStatusUpdates?: ComponentStatusChange[];
  createdAt: Date;
}

const StatusChangeSchema = {
  from: { type: String, enum: Object.values(IncidentStatus), required: false },
  to: { type: String, enum: Object.values(IncidentStatus), required: true },
};

const ComponentStatusChangeSchema = {
  componentId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
};

const IncidentUpdateSchema = {
  message: { type: String, required: true },
  statusUpdate: StatusChangeSchema,
  componentStatusUpdates: [ComponentStatusChangeSchema],
  createdAt: { type: Date, default: Date.now },
};

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

  @Prop({ type: [IncidentUpdateSchema] })
  updates: IncidentUpdate[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);
