import mongoose, { Schema, Document } from 'mongoose';
import { COMPONENT_STATUS, ComponentStatus } from './Component';

export interface IIncidentUpdate extends Document {
  updatedComponentStatuses: Array<{
    componentId: string;
    name: string;
    from: ComponentStatus;
    to: ComponentStatus;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Component
 */
const IncidentUpdateComponentsUpdatedStatusSchema = new Schema({
  from: { type: String, enum: COMPONENT_STATUS, required: true },
  to: { type: String, enum: COMPONENT_STATUS, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const IncidentUpdateComponentsUpdatedSchema = new Schema({
  component: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
  },
  status: {
    type: IncidentUpdateComponentsUpdatedStatusSchema,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

/**
 * Group
 */
const IncidentUpdatGroupsUpdatedStatusSchema = new Schema({
  from: { type: String, enum: COMPONENT_STATUS, required: true },
  to: { type: String, enum: COMPONENT_STATUS, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const IncidentUpdateGroupsUpdatedSchema = new Schema({
  group: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
  },
  status: {
    type: IncidentUpdatGroupsUpdatedStatusSchema,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});



const IncidentUpdateSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  status: {
    type: String,
    enum: ['investigating', 'identified', 'monitoring', 'resolved'],
    default: 'investigating',
  },
  impact: {
    type: String,
    enum: ['none', 'minor', 'major', 'critical'],
    required: [true, 'Impact level is required'],
  },
  affectedSystems: [{
    type: String,
    required: [true, 'At least one affected system is required'],
  }],
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Prevent mongoose from creating a new model if it already exists
export default mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema); 