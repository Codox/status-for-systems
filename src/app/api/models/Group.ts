import { Schema, model, models } from 'mongoose';

const groupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['operational', 'degraded', 'outage'],
    required: true,
    default: 'operational'
  },
  components: [{
    type: Schema.Types.ObjectId,
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

groupSchema.methods.calculateStatus = async function() {
  await this.populate('components');
  
  if (!this.components || this.components.length === 0) {
    this.status = 'operational';
    return;
  }

  const statuses = this.components.map((c: { status: string }) => c.status);
  
  if (statuses.includes('outage')) {
    this.status = 'outage';
  } else if (statuses.includes('degraded')) {
    this.status = 'degraded';
  } else {
    this.status = 'operational';
  }
};

export const Group = models.Group || model('Group', groupSchema); 