import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['operational', 'degraded', 'outage', 'maintenance'],
    default: 'operational'
  },
  components: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

groupSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

groupSchema.methods.calculateStatus = function(components: { status: string }[]) {
  if (!components || components.length === 0) return 'operational';
  
  const statusCounts = components.reduce((acc, component) => {
    acc[component.status] = (acc[component.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (statusCounts['maintenance']) return 'maintenance';
  
  if (statusCounts['outage']) return 'outage';
  
  if (statusCounts['degraded']) return 'degraded';
  
  return 'operational';
};

export const Group = mongoose.models.Group || mongoose.model('Group', groupSchema); 