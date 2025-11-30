import dbConnect from '@/lib/mongodb';
import ComponentModel, { Component } from '@/lib/entities/component.entity';
import GroupModel from '@/lib/entities/group.entity';
import { CreateComponentRequest } from '@/lib/requests/create-component.request';
import { UpdateComponentRequest } from '@/lib/requests/update-component.request';

export class ComponentsService {
  async getComponents(): Promise<Component[]> {
    await dbConnect();
    
    return await ComponentModel.find().exec();
  }

  async getUngrouped(): Promise<Component[]> {
    await dbConnect();
    
    // Get all component IDs that are assigned to groups
    const groups = await GroupModel.find({}, { components: 1 }).exec();
    const assignedComponentIds = groups
      .flatMap((group) => group.components)
      .map((componentId) => componentId.toString());

    // Find components that are not in any group
    return await ComponentModel
      .find({ _id: { $nin: assignedComponentIds } })
      .exec();
  }

  async create(createComponentRequest: CreateComponentRequest): Promise<Component> {
    await dbConnect();

    // Create the component
    const component = new ComponentModel({
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
      await GroupModel.updateMany(
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
    await dbConnect();

    // Update the component fields
    const updateData: any = {};

    if (updateComponentRequest.name !== undefined) {
      updateData.name = updateComponentRequest.name;
    }

    if (updateComponentRequest.description !== undefined) {
      updateData.description = updateComponentRequest.description;
    }

    const updatedComponent = await ComponentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedComponent) {
      throw new Error(`Component with ID ${id} not found`);
    }

    // Handle group assignments if provided
    if (updateComponentRequest.groups !== undefined) {
      // Remove component from all groups first
      await GroupModel.updateMany(
        { components: id },
        { $pull: { components: id } },
      );

      // Add component to specified groups
      if (updateComponentRequest.groups.length > 0) {
        await GroupModel.updateMany(
          { _id: { $in: updateComponentRequest.groups } },
          { $addToSet: { components: id } },
        );
      }
    }

    return updatedComponent;
  }
}

export default new ComponentsService();
