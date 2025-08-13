// Note: Avoid Nest TestingModule to prevent transforming node_modules. We'll instantiate the service directly.
// Mock Nest and Mongoose to avoid pulling modern JS from node_modules in Jest
jest.mock('@nestjs/common', () => ({ Injectable: () => () => {}, NotFoundException: class NotFoundException extends Error {} }));
jest.mock('@nestjs/mongoose', () => ({ InjectModel: () => () => {}, Prop: () => () => {}, Schema: () => () => {}, SchemaFactory: { createForClass: () => ({}) } }));
// Provide a minimal mongoose mock so importing the service works without loading real mongoose
jest.mock('mongoose', () => ({ Model: class {}, Document: class {}, Types: { ObjectId: class { private v: string; constructor(v?: string){ this.v = v || Math.random().toString(36).slice(2);} toString(){ return this.v;} } } }));
import { IncidentsService } from './incidents.service';
import { Incident, IncidentStatus } from './entities/incident.entity';
import { IncidentUpdate, IncidentUpdateType } from './entities/incident-update.entity';
import { Component, ComponentStatus } from '../components/entities/component.entity';

// Simple in-memory stores to emulate Mongo collections
const componentsStore: any[] = [];
const incidentsStore: any[] = [];
const incidentUpdatesStore: any[] = [];

// Helper to create simple ObjectId-like values for tests
let __id = 0;
const oid = () => ({ toString: () => `id_${++__id}` });

// Mock Component Model
function createComponentModel() {
  return {
    // query methods
    find: jest.fn().mockImplementation((query: any) => {
      const filter = query?._id?.$in as string[] | undefined;
      const result = filter
        ? componentsStore.filter((c) => filter.map(String).includes(String(c._id)))
        : componentsStore;
      return { exec: jest.fn().mockResolvedValue(result) } as any;
    }),
    updateOne: jest.fn().mockImplementation((filter: any, pipeline: any[]) => {
      const id = String(filter._id);
      const found = componentsStore.find((c) => String(c._id) === id);
      if (found) {
        // Only handle [{ $set: { status } }]
        const setStage = pipeline.find((p) => p.$set);
        if (setStage) {
          Object.assign(found, setStage.$set);
        }
      }
      return Promise.resolve({ acknowledged: true });
    }),
  } as any;
}

// Mock Incident Model (constructor + instance .save)
function IncidentModel(this: any, doc: any) {
  Object.assign(this, doc);
  this._id = this._id || oid();
  this.save = jest.fn().mockImplementation(async () => {
    const existing = incidentsStore.find((i) => String(i._id) === String(this._id));
    if (!existing) incidentsStore.push(this);
    return this;
  });
}
(IncidentModel as any).find = jest.fn().mockImplementation(() => ({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(incidentsStore),
}));
(IncidentModel as any).findById = jest.fn().mockImplementation((id: string) => ({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(incidentsStore.find((i) => String(i._id) === String(id)) || null),
}));

// Mock IncidentUpdate Model (constructor + instance .save)
function IncidentUpdateModel(this: any, doc: any) {
  Object.assign(this, doc);
  this._id = this._id || oid();
  this.save = jest.fn().mockImplementation(async () => {
    incidentUpdatesStore.push(this);
    return this;
  });
}
(IncidentUpdateModel as any).find = jest.fn().mockImplementation((query: any) => ({
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(
    incidentUpdatesStore.filter((u) => String(u.incidentId) === String(query.incidentId))
  ),
}));

// Reset stores before each test
beforeEach(() => {
  componentsStore.length = 0;
  incidentsStore.length = 0;
  incidentUpdatesStore.length = 0;
});

describe('IncidentsService', () => {
  let service: IncidentsService;
  let componentModel: any;

  beforeEach(async () => {
    componentModel = createComponentModel();
    service = new IncidentsService(
      IncidentModel as any,
      IncidentUpdateModel as any,
      componentModel as any,
    );
  });

  it('create() should create an incident, update component statuses, and save initial incident update', async () => {
    // Arrange: seed two components
    const compA = { _id: oid(), status: ComponentStatus.OPERATIONAL, id: function(){ return String(this._id);} } as any;
    const compB = { _id: oid(), status: ComponentStatus.OPERATIONAL, id: function(){ return String(this._id);} } as any;
    componentsStore.push(compA, compB);

    const req = {
      title: 'Outage',
      description: 'API down',
      affectedComponents: [
        { id: String(compA._id), status: ComponentStatus.MAJOR },
        { id: String(compB._id), status: ComponentStatus.DEGRADED },
      ],
    } as any;

    // Act
    const incident = await service.create(req);

    // Assert incident saved
    expect(incident).toBeDefined();
    expect(incidentsStore.length).toBe(1);
    expect(incident.title).toBe('Outage');

    // Components updated via updateOne
    expect(componentModel.updateOne).toHaveBeenCalledTimes(2);
    expect(componentsStore.find((c) => String(c._id) === String(compA._id))!.status).toBe(
      ComponentStatus.MAJOR,
    );
    expect(componentsStore.find((c) => String(c._id) === String(compB._id))!.status).toBe(
      ComponentStatus.DEGRADED,
    );

    // Incident update saved with component status updates for both
    expect(incidentUpdatesStore.length).toBe(1);
    const initUpdate = incidentUpdatesStore[0];
    expect(initUpdate.type).toBe(IncidentUpdateType.CREATED);
    expect(initUpdate.statusUpdate?.to).toBe(IncidentStatus.INVESTIGATING);
    expect(initUpdate.componentStatusUpdates).toHaveLength(2);
    const ids = initUpdate.componentStatusUpdates.map((u: any) => String(u.id));
    expect(ids).toEqual(expect.arrayContaining([String(compA._id), String(compB._id)]));
  });

  it('createIncidentUpdate() with status RESOLVED sets affected components to OPERATIONAL and records updates', async () => {
    // Arrange: create incident with affected component in non-operational state
    const comp = { _id: oid(), status: ComponentStatus.MAJOR } as any;
    componentsStore.push(comp);

    const incident: any = new (IncidentModel as any)({
      title: 'Incident',
      description: 'Desc',
      status: IncidentStatus.IDENTIFIED,
      impact: 'minor',
      affectedComponents: [comp],
    });
    await incident.save();

    const req = {
      incidentId: String(incident._id),
      status: IncidentStatus.RESOLVED,
      description: 'Fixed',
    } as any;

    // Act
    const update = await service.createIncidentUpdate(req);

    // Assert: update type and component changes
    expect(update.type).toBe(IncidentUpdateType.RESOLVED);
    expect(update.statusUpdate?.to).toBe(IncidentStatus.RESOLVED);
    // Component should now be OPERATIONAL
    expect(componentsStore[0].status).toBe(ComponentStatus.OPERATIONAL);
    // And the change recorded
    expect(update.componentStatusUpdates).toEqual([
      {
        id: String(comp._id),
        from: ComponentStatus.MAJOR,
        to: ComponentStatus.OPERATIONAL,
      },
    ]);
  });
});
