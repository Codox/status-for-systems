import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from './entities/group.entity';
import { CreateGroupRequest } from './requests/create-group.request';
import { UpdateGroupRequest } from './requests/update-group.request';
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

  async update(
    id: string,
    updateGroupRequest: UpdateGroupRequest,
  ): Promise<Group> {
    const updateData: any = {};

    // Update name if provided
    if (updateGroupRequest.name !== undefined) {
      updateData.name = updateGroupRequest.name;
    }

    // Update description if provided
    if (updateGroupRequest.description !== undefined) {
      updateData.description = updateGroupRequest.description;
    }

    // Update components if provided
    if (updateGroupRequest.components !== undefined) {
      updateData.components = updateGroupRequest.components;
    }

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('components')
      .exec();

    if (!updatedGroup) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return updatedGroup;
  }
}
