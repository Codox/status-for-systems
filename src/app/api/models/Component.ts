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
  },
  checkUrl: {
    type: String,
    required: true
  },
  checkMethod: {
    type: String,
    enum: ['GET', 'POST', 'HEAD'],
    default: 'GET'
  },
  expectedStatus: {
    type: Number,
    default: 200
  },
  timeout: {
    type: Number,
    default: 5000 // 5 seconds
  }
});

export const Component = models.Component || model('Component', componentSchema); 