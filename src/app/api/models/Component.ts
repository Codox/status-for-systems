import { Schema, model, models } from 'mongoose';

const componentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['operational', 'degraded', 'outage'],
    required: true,
    default: 'operational'
  },
  description: String,
  lastChecked: {
    type: Date,
    default: Date.now
  }
});

export const Component = models.Component || model('Component', componentSchema); 