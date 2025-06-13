import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Component } from './entities/component.entity';

@Injectable()
export class ComponentsService {
  constructor(
    @InjectModel(Component.name) private readonly componentModel: Model<Component>,
  ) {}

  async findAll(): Promise<Component[]> {
    return this.componentModel.find().exec();
  }
} 