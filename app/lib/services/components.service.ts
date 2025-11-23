import dbConnect from '@/lib/mongodb';
import ComponentModel, { Component } from '@/lib/entities/component.entity';
import GroupModel from '@/lib/entities/group.entity';
import { CreateComponentRequest } from '@/lib/requests/create-component.request';

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
}

export default new ComponentsService();
