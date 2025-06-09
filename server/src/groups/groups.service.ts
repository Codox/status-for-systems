import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
  ) {}

  async findAll(): Promise<Group[]> {
    return this.groupModel.find().populate('components').exec();
  }

  async findOne(id: string): Promise<Group> {
    return this.groupModel.findById(id).populate('components').exec();
  }
} 