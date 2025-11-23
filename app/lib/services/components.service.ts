import dbConnect from '@/lib/mongodb';
import ComponentModel, { Component } from '@/lib/entities/component.entity';
import GroupModel from '@/lib/entities/group.entity';

export class ComponentsService {
  async getComponents(): Promise<Component[]> {
    await dbConnect();
    
    return await ComponentModel.find().exec();
  }

  async findUngrouped(): Promise<Component[]> {
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
}

export default new ComponentsService();
