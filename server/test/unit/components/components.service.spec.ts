import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ComponentsService } from '../../../src/components/components.service';
import { Component } from '../../../src/components/entities/component.entity';
import { Group } from '../../../src/groups/entities/group.entity';

// In-memory stores
const componentsStore: any[] = [];
const groupsStore: any[] = [];

// Mock Component Model
const componentModel = {
  find: jest.fn((query?: any) => {
    if (!query) return { exec: jest.fn().mockResolvedValue(componentsStore) } as any;
    const nin = query._id?.$nin as string[] | undefined;
    const result = nin
      ? componentsStore.filter((c) => !nin.map(String).includes(String(c._id)))
      : componentsStore;
    return { exec: jest.fn().mockResolvedValue(result) } as any;
  }),
} as any;

// Mock Group Model
const groupModel = {
  find: jest.fn((_q: any, _proj: any) => ({
    exec: jest.fn().mockResolvedValue(groupsStore),
  })),
  updateMany: jest.fn(),
} as any;

describe('ComponentsService (unit)', () => {
  let service: ComponentsService;

  beforeEach(async () => {
    componentsStore.length = 0;
    groupsStore.length = 0;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComponentsService,
        { provide: getModelToken(Component.name), useValue: componentModel },
        { provide: getModelToken(Group.name), useValue: groupModel },
      ],
    }).compile();

    service = module.get<ComponentsService>(ComponentsService);
  });

  it('findUngrouped() should return only components not referenced in any group', async () => {
    const c1 = { _id: '1' } as any;
    const c2 = { _id: '2' } as any;
    const c3 = { _id: '3' } as any;
    componentsStore.push(c1, c2, c3);
    groupsStore.push({ components: ['2'] }, { components: ['3'] });

    const ungrouped = await service.findUngrouped();

    expect(ungrouped).toHaveLength(1);
    expect(ungrouped[0]._id).toBe('1');
  });
});
