import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SubscriberType {
  EMAIL = 'email',
}

@Schema({
  collection: 'subscribers',
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
export class Subscriber extends Document {
  @Prop({
    type: String,
    enum: SubscriberType,
    required: true,
    default: SubscriberType.EMAIL,
  })
  type: SubscriberType;

  @Prop()
  address: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
