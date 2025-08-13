import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GroupsService } from '../../../src/groups/groups.service';
import { Group } from '../../../src/groups/entities/group.entity';
import { NotFoundException } from '@nestjs/common';

const groupsStore: any[] = [];

const groupModel = {
  find: jest.fn(() => ({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(groupsStore),
  })),
  findById: jest.fn((id: string) => ({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(
      groupsStore.find((g) => String(g._id) === String(id)) || null,
    ),
  })),
  findByIdAndUpdate: jest.fn((id: string, update: any) => ({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null), // default not found
  })),
  save: jest.fn(),
} as any;

describe('GroupsService (unit)', () => {
  let service: GroupsService;

  beforeEach(async () => {
    groupsStore.length = 0;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: getModelToken(Group.name), useValue: groupModel },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('update() should throw NotFoundException when group not found', async () => {
    await expect(
      service.update('nonexistent', { name: 'New', description: 'D' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(groupModel.findByIdAndUpdate).toHaveBeenCalled();
  });
});
