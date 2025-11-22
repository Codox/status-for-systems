import { Schema, model, models, Document, Types } from 'mongoose';
import { Component } from './component.entity';

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

export interface Incident extends Document {
  title: string;
  description: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  affectedComponents: Component[];
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new Schema<Incident>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(IncidentStatus),
      default: IncidentStatus.INVESTIGATING,
    },
    impact: {
      type: String,
      enum: Object.values(IncidentImpact),
      default: IncidentImpact.MINOR,
    },
    affectedComponents: [{ type: Types.ObjectId, ref: 'Component' }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default models.Incident || model<Incident>('Incident', IncidentSchema);
