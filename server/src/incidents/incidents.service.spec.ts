// Mock heavy NestJS/Mongoose modules to avoid loading modern JS from node_modules during unit tests
jest.mock('@nestjs/common', () => ({
  Injectable: () => () => {},
  NotFoundException: class NotFoundException extends Error {
    constructor(message?: string) {
      super(message);
      this.name = 'NotFoundException';
    }
  },
}));

jest.mock('@nestjs/mongoose', () => ({
  // minimal exports used by entity files
  Prop: () => () => {},
  Schema: () => () => {},
  SchemaFactory: { createForClass: () => ({}) },
  InjectModel: () => () => {},
  getModelToken: (name: string) => `Model_${name}`,
}));

jest.mock('mongoose', () => ({
  Model: class {},
  Document: class {},
  Types: { ObjectId: function ObjectId() {} },
}));

jest.mock('remeda', () => ({
  map: (arr: any[], fn: any) => (Array.isArray(arr) ? arr.map(fn) : []),
  find: (arr: any[], pred: any) => (Array.isArray(arr) ? arr.find(pred) : undefined),
  forEach: (arr: any[], fn: any) => (Array.isArray(arr) ? arr.forEach(fn) : undefined),
}), { virtual: true });

import { IncidentsService } from './incidents.service';
import { Incident, IncidentImpact, IncidentStatus } from './entities/incident.entity';
import { IncidentUpdate, IncidentUpdateType } from './entities/incident-update.entity';
import { Component, ComponentStatus } from '../components/entities/component.entity';
import { CreateIncidentUpdateRequest } from './requests/create-incident-update.request';

// Helper to build chainable mongoose .findById().populate().exec()
const chainable = <T>(value: T) => ({
  populate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(value),
  }),
});

// Build a fake incident document with mutable fields and save()
const buildIncidentDoc = (overrides: Partial<Incident> & { _id?: any } = {}) => {
  const base: any = {
    _id: overrides._id || { toString: () => 'incident-id' },
    title: 't',
    description: 'd',
    status: IncidentStatus.INVESTIGATING,
    impact: IncidentImpact.MINOR,
    affectedComponents: [],
    save: jest.fn().mockResolvedValue(undefined),
  };
  return Object.assign(base, overrides);
};

// Build a fake component document
const buildComponentDoc = (overrides: Partial<Component> & { _id?: any } = {}) => {
  const base: any = {
    _id: overrides._id || { toString: () => 'comp-id' },
    id: (overrides._id as any)?.toString?.() || 'comp-id',
    name: 'c',
    description: 'cd',
    status: ComponentStatus.OPERATIONAL,
  };
  return Object.assign(base, overrides);
};

// Simple mock for incidentUpdateModel constructor that captures constructor args and returns an object with save
const makeIncidentUpdateModel = () => {
  const ctor: any = jest.fn(function (this: any, data: any) {
    this._data = data;
    Object.assign(this, data);
    const self = this;
    this.save = jest.fn().mockImplementation(() =>
      Promise.resolve({
        componentStatusUpdates: self.componentStatusUpdates,
        statusUpdate: self.statusUpdate,
        impactUpdate: self.impactUpdate,
        type: self._data.type,
        incidentId: self._data.incidentId,
        description: self._data.description,
        _id: 'iu-id',
      }),
    );
    return this;
  });
  return ctor;
};


describe('IncidentsService.createIncidentUpdate', () => {
  let service: IncidentsService;
  let incidentModel: any;
  let incidentUpdateModel: any;
  let componentModel: any;

  beforeEach(async () => {
    incidentModel = {
      findById: jest.fn(),
    };
    incidentUpdateModel = makeIncidentUpdateModel();
    componentModel = {
      find: jest.fn(),
      updateOne: jest.fn().mockResolvedValue(undefined),
    };

    // instantiate service directly without Nest TestingModule
    service = new IncidentsService(
      incidentModel as any,
      incidentUpdateModel as any,
      componentModel as any,
    );
  });

  it('throws NotFoundException if incident not found', async () => {
    incidentModel.findById.mockReturnValue(chainable(null));

    const req: CreateIncidentUpdateRequest = {
      incidentId: '64f000000000000000000000',
      description: 'desc',
    } as any;

    await expect(service.createIncidentUpdate(req)).rejects.toMatchObject({ name: 'NotFoundException' });
  });

  it('creates an update with type UPDATED and no status/impact updates when no changes provided', async () => {
    const incidentDoc = buildIncidentDoc({
      _id: { toString: () => 'i1' },
      status: IncidentStatus.INVESTIGATING,
      impact: IncidentImpact.MINOR,
    });
    incidentModel.findById.mockReturnValue(chainable(incidentDoc));

    const req: CreateIncidentUpdateRequest = {
      incidentId: '64f000000000000000000001',
      description: 'no changes',
    } as any;

    const result = await service.createIncidentUpdate(req);

    // Constructor called with expected data
    expect(incidentUpdateModel).toHaveBeenCalledTimes(1);
    const ctorArg = (incidentUpdateModel as jest.Mock).mock.calls[0][0];
    expect(ctorArg.type).toBe(IncidentUpdateType.UPDATED);
    expect(ctorArg.statusUpdate).toBeUndefined();
    expect(ctorArg.impactUpdate).toBeUndefined();
    expect(Array.isArray(ctorArg.componentStatusUpdates)).toBe(true);
    expect(ctorArg.componentStatusUpdates.length).toBe(0);

    // Incident should not be saved when nothing changes
    expect(incidentDoc.save).not.toHaveBeenCalled();

    // Returned value from save()
    expect(result.type).toBe(IncidentUpdateType.UPDATED);
  });

  it('updates status and sets statusUpdate; resolves sets type RESOLVED and updates affected components selectively', async () => {
    const comp1 = buildComponentDoc({ _id: { toString: () => 'c1' }, status: ComponentStatus.DEGRADED });
    const comp2 = buildComponentDoc({ _id: { toString: () => 'c2' }, status: ComponentStatus.OPERATIONAL });
    const incidentDoc = buildIncidentDoc({
      _id: { toString: () => 'i2' },
      status: IncidentStatus.IDENTIFIED,
      impact: IncidentImpact.MAJOR,
      affectedComponents: [comp1, comp2],
    });
    incidentModel.findById.mockReturnValue(chainable(incidentDoc));

    const req: CreateIncidentUpdateRequest = {
      incidentId: '64f000000000000000000002',
      description: 'resolving',
      status: IncidentStatus.RESOLVED,
    } as any;

    const saved = await service.createIncidentUpdate(req);

    // Incident saved due to status change
    expect(incidentDoc.save).toHaveBeenCalled();

    // Constructor data
    const ctorArg = (incidentUpdateModel as jest.Mock).mock.calls.pop()[0];
    expect(ctorArg.type).toBe(IncidentUpdateType.RESOLVED);
    expect(ctorArg.statusUpdate).toEqual({ from: IncidentStatus.IDENTIFIED, to: IncidentStatus.RESOLVED });

    // Affected components updated: only non-operational ones
    expect(componentModel.updateOne).toHaveBeenCalledTimes(1);
    expect(componentModel.updateOne).toHaveBeenCalledWith(
      { _id: comp1._id },
      [{ $set: { status: ComponentStatus.OPERATIONAL } }]
    );

    // Component status updates recorded only for changed component
    expect(saved.componentStatusUpdates).toEqual([
      { id: 'c1', from: ComponentStatus.DEGRADED, to: ComponentStatus.OPERATIONAL },
    ]);
  });

  it('applies componentUpdates and records only actual changes', async () => {
    const incidentDoc = buildIncidentDoc({
      _id: { toString: () => 'i3' },
      status: IncidentStatus.INVESTIGATING,
      impact: IncidentImpact.MINOR,
    });
    incidentModel.findById.mockReturnValue(chainable(incidentDoc));

    const dbCompA = buildComponentDoc({ _id: { toString: () => 'a' }, status: ComponentStatus.DEGRADED });
    const dbCompB = buildComponentDoc({ _id: { toString: () => 'b' }, status: ComponentStatus.MAJOR });

    componentModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([dbCompA, dbCompB]) });

    const req: CreateIncidentUpdateRequest = {
      incidentId: '64f000000000000000000003',
      description: 'components update',
      componentUpdates: [
        { id: 'a', status: ComponentStatus.DEGRADED }, // no actual change
        { id: 'b', status: ComponentStatus.PARTIAL }, // change
      ],
    } as any;

    const saved = await service.createIncidentUpdate(req);

    // updateOne called for each provided component regardless (as per implementation)
    expect(componentModel.updateOne).toHaveBeenCalledTimes(2);

    // Only changed component appears in componentStatusUpdates
    expect(saved.componentStatusUpdates).toEqual([
      { id: 'b', from: ComponentStatus.MAJOR, to: ComponentStatus.PARTIAL },
    ]);
  });
});
