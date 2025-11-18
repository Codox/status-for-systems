import { Schema, model, models, Document, Types } from 'mongoose';
import { IncidentStatus, IncidentImpact } from './incident.entity';

export enum IncidentUpdateType {
  CREATED = 'created',
  UPDATED = 'updated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ComponentStatus {
  OPERATIONAL = 'operational',
  UNDER_MAINTENANCE = 'under_maintenance',
  DEGRADED = 'degraded',
  PARTIAL = 'partial',
  MAJOR = 'major',
  DOWN = 'down',
}

export interface IncidentUpdate extends Document {
  incidentId: Types.ObjectId;
  description?: string;
  type: IncidentUpdateType;
  statusUpdate?: {
    from: IncidentStatus | null;
    to: IncidentStatus;
  };
  impactUpdate?: {
    from: IncidentImpact | null;
    to: IncidentImpact;
  };
  componentStatusUpdates?: {
    id: string;
    from: ComponentStatus;
    to: ComponentStatus;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const IncidentUpdateSchema = new Schema<IncidentUpdate>(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true },
    description: { type: String, required: false },
    type: {
      type: String,
      enum: Object.values(IncidentUpdateType),
      required: true,
    },
    statusUpdate: {
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
    },
    impactUpdate: {
      type: {
        from: {
          type: String,
          enum: Object.values(IncidentImpact),
          required: false,
        },
        to: {
          type: String,
          enum: Object.values(IncidentImpact),
          required: true,
        },
      },
      required: false,
    },
    componentStatusUpdates: {
      type: [
        {
          id: { type: String, required: true },
          from: { type: String, required: true },
          to: { type: String, required: true },
        },
      ],
      required: false,
    },
  },
  {
    collection: 'incident_updates',
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

export default models.IncidentUpdate || model<IncidentUpdate>('IncidentUpdate', IncidentUpdateSchema);
