// Avoid Nest TestingModule; instantiate service directly.
// Mock Nest and Mongoose packages used by service imports
jest.mock('@nestjs/common', () => ({ Injectable: () => () => {} }));
jest.mock('@nestjs/mongoose', () => ({ InjectModel: () => () => {} }));
jest.mock('mongoose', () => ({ Model: class {} }));
import { ComponentsService } from './components.service';
import { Component } from './entities/component.entity';
import { Group } from '../groups/entities/group.entity';

// In-memory stores
const componentsStore: any[] = [];
const groupsStore: any[] = [];

function createComponentModel() {
  return {
    find: jest.fn().mockImplementation((query?: any) => {
      if (!query) return { exec: jest.fn().mockResolvedValue(componentsStore) } as any;
      const nin = query._id?.$nin as string[] | undefined;
      const result = nin
        ? componentsStore.filter((c) => !nin.map(String).includes(String(c._id)))
        : componentsStore;
      return { exec: jest.fn().mockResolvedValue(result) } as any;
    }),
    // For create: instance is created via new this.componentModel in service; but service uses constructor only to save in create(), which we won't test here.
  } as any;
}

function createGroupModel() {
  return {
    find: jest.fn().mockImplementation((_q: any, _proj: any) => ({
      exec: jest.fn().mockResolvedValue(groupsStore),
    })),
    updateMany: jest.fn(),
  } as any;
}

beforeEach(() => {
  componentsStore.length = 0;
  groupsStore.length = 0;
});

describe('ComponentsService', () => {
  let service: ComponentsService;
  let groupModel: any;

  beforeEach(async () => {
    const componentModel = createComponentModel();
    groupModel = createGroupModel();

    service = new ComponentsService(componentModel as any, groupModel as any);
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
