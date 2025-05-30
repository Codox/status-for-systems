import { Schema, model, models } from 'mongoose';

const groupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
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

export const Group = models.Group || model('Group', groupSchema); 