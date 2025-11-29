import dbConnect from '@/lib/mongodb';
import GroupModel, {Group} from '@/lib/entities/group.entity';
import ComponentModel from '@/lib/entities/component.entity';
import { CreateGroupRequest } from '@/lib/requests/create-group.request';
import { UpdateGroupRequest } from '@/lib/requests/update-group.request';

export class GroupsService {
  async getGroups(): Promise<Group[]> {
    await dbConnect();
    
    void ComponentModel;

    return await GroupModel.find()
        .populate('components')
        .exec();
  }

  async create(createGroupRequest: CreateGroupRequest): Promise<Group> {
    await dbConnect();
    
    const group = new GroupModel(createGroupRequest);
    return group.save();
  }

  async update(
    id: string,
    updateGroupRequest: UpdateGroupRequest,
  ): Promise<Group> {
    await dbConnect();
    
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

    const updatedGroup = await GroupModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('components')
      .exec();

    if (!updatedGroup) {
      throw new Error(`Group with ID ${id} not found`);
    }

    return updatedGroup;
  }
}

export default new GroupsService();


