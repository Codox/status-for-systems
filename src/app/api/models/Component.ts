import mongoose from 'mongoose';

export const COMPONENT_STATUS = ['operational', 'degraded', 'outage', 'maintenance'] as const;
export type ComponentStatus = typeof COMPONENT_STATUS[number];

const componentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: COMPONENT_STATUS,
    default: 'operational',
  },
  lastChecked: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt timestamp before saving
componentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Component = mongoose.models.Component || mongoose.model('Component', componentSchema); 