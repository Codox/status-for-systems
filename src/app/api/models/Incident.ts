import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  affectedSystems: string[];
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema: Schema = new Schema({
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