import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['operational', 'degraded', 'outage', 'maintenance'],
    default: 'operational',
  },
  checkUrl: {
    type: String,
    required: true,
  },
  checkMethod: {
    type: String,
    enum: ['GET', 'POST', 'HEAD'],
    default: 'GET',
  },
  expectedStatus: {
    type: Number,
    default: 200,
  },
  timeout: {
    type: Number,
    default: 5000, // 5 seconds
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