import { Schema, model, models, Document } from 'mongoose';

export interface Component extends Document {
  name: string;
  status: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComponentSchema = new Schema<Component>(
  {
    name: { type: String, required: true },
    status: { type: String, required: true },
    description: { type: String },
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

export default models.Component || model<Component>('Component', ComponentSchema);
