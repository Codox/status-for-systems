import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from './entities/group.entity';
import { CreateGroupRequest } from './requests/create-group.request';
import { Component } from '../components/entities/component.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(Component.name)
    private readonly componentModel: Model<Component>,
  ) {}

  async findAll(): Promise<Group[]> {
    return this.groupModel.find().populate('components').exec();
  }

  async findOne(id: string): Promise<Group> {
    return this.groupModel.findById(id).populate('components').exec();
  }

  async create(createGroupRequest: CreateGroupRequest): Promise<Group> {
    const group = new this.groupModel(createGroupRequest);
    return group.save();
  }
}
