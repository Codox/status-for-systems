import dbConnect from '@/lib/mongodb';
import GroupModel, {Group} from '@/lib/entities/group.entity';
import ComponentModel from '@/lib/entities/component.entity';

export class GroupsService {
  async getGroups(): Promise<Group[]> {
    await dbConnect();
    
    void ComponentModel;

    return await GroupModel.find()
        .populate('components')
        .exec();
  }
}

export default new GroupsService();


