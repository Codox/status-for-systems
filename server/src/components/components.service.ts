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
