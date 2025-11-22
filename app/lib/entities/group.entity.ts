import { Schema, model, models, Document, Types } from 'mongoose';
import { Component } from './component.entity';

export interface Group extends Document {
  name: string;
  description: string;
  components: Component[];
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<Group>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    components: [{ type: Types.ObjectId, ref: 'Component' }],
  },
  {
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

export default models.Group || model<Group>('Group', GroupSchema);
