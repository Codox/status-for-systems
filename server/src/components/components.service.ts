import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { map, flatMap, pipe } from 'remeda';
import { Component } from './entities/component.entity';
import { Group } from '../groups/entities/group.entity';
import { CreateComponentRequest } from './requests/create-component.request';
import { UpdateComponentRequest } from './requests/update-component.request';

@Injectable()
export class ComponentsService {
  constructor(
    @InjectModel(Component.name)
    private readonly componentModel: Model<Component>,
    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,
  ) {}

  async findAll(): Promise<Component[]> {
    return this.componentModel.find().exec();
  }

  async findUngrouped(): Promise<Component[]> {
    // Get all component IDs that are assigned to groups
    const groups = await this.groupModel.find({}, { components: 1 }).exec();
    const assignedComponentIds = pipe(
      groups,
      flatMap((group) => group.components),
      map((componentId) => componentId.toString()),
    );

    // Find components that are not in any group
    return this.componentModel
      .find({ _id: { $nin: assignedComponentIds } })
      .exec();
  }

  async create(
    createComponentRequest: CreateComponentRequest,
  ): Promise<Component> {
    // Create the component
    const component = new this.componentModel({
      name: createComponentRequest.name,
      description: createComponentRequest.description,
      status: createComponentRequest.status,
    });

    const savedComponent = await component.save();

    // If groups are specified, add the component to those groups
    if (
      createComponentRequest.groups &&
      createComponentRequest.groups.length > 0
    ) {
      await this.groupModel.updateMany(
        { _id: { $in: createComponentRequest.groups } },
        { $addToSet: { components: savedComponent._id } },
      );
    }

    return savedComponent;
  }

  async update(
    id: string,
    updateComponentRequest: UpdateComponentRequest,
  ): Promise<Component> {
    // Update the component fields (assuming full object replacement)
    const updateData: any = {
      name: updateComponentRequest.name,
      description: updateComponentRequest.description,
    };

    const updatedComponent = await this.componentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedComponent) {
      throw new Error(`Component with ID ${id} not found`);
    }

    // Handle group assignments (assuming full object replacement)
    // Remove component from all groups first
    await this.groupModel.updateMany(
      { components: id },
      { $pull: { components: id } },
    );

    // Add component to specified groups
    if (
      updateComponentRequest.groups &&
      updateComponentRequest.groups.length > 0
    ) {
      await this.groupModel.updateMany(
        { _id: { $in: updateComponentRequest.groups } },
        { $addToSet: { components: id } },
      );
    }

    return updatedComponent;
  }
}
