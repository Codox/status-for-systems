import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ComponentStatus {
  OPERATIONAL = 'operational',
  DEGRADED = 'degraded',
  PARTIAL = 'partial',
  MAJOR = 'major',
  UNDER_MAINTENANCE = 'under_maintenance',
}

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Component extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: ComponentStatus,
    default: ComponentStatus.OPERATIONAL,
  })
  status: ComponentStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ComponentSchema = SchemaFactory.createForClass(Component); 