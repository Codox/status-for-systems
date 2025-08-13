// Avoid Nest TestingModule; instantiate service directly.
// Mock Nest and Mongoose packages used by service imports
jest.mock('@nestjs/common', () => ({ Injectable: () => () => {}, NotFoundException: class NotFoundException extends Error {} }));
jest.mock('@nestjs/mongoose', () => ({ InjectModel: () => () => {}, Prop: () => () => {}, Schema: () => () => {}, SchemaFactory: { createForClass: () => ({}) } }));
jest.mock('mongoose', () => ({ Model: class {}, Document: class {} }));
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { NotFoundException } from '@nestjs/common';

const groupsStore: any[] = [];

function createGroupModel() {
  return {
    find: jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(groupsStore),
    })),
    findById: jest.fn().mockImplementation((id: string) => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(groupsStore.find((g) => String(g._id) === String(id)) || null),
    })),
    findByIdAndUpdate: jest.fn().mockImplementation((id: string, update: any) => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(() => {
        const idx = groupsStore.findIndex((g) => String(g._id) === String(id));
        if (idx === -1) return null;
        groupsStore[idx] = { ...groupsStore[idx], ...update };
        return groupsStore[idx];
      })
    })),
  } as any;
}

beforeEach(() => {
  groupsStore.length = 0;
});

describe('GroupsService', () => {
  let service: GroupsService;
  let model: any;

  beforeEach(async () => {
    model = createGroupModel();

    service = new GroupsService(model as any);
  });

  it('update() should throw NotFoundException when group not found', async () => {
    await expect(
      service.update('nonexistent', { name: 'New', description: 'D' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
