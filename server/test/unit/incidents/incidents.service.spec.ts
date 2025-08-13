import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { IncidentsService } from '../../../src/incidents/incidents.service';
import { Incident, IncidentStatus } from '../../../src/incidents/entities/incident.entity';
import { IncidentUpdate, IncidentUpdateType } from '../../../src/incidents/entities/incident-update.entity';
import { Component, ComponentStatus } from '../../../src/components/entities/component.entity';

// In-memory stores to emulate collections
const componentsStore: any[] = [];
const incidentsStore: any[] = [];
const incidentUpdatesStore: any[] = [];

let __id = 0;
const oid = () => `id_${++__id}`;

// Mock Component Model
const componentModel = {
  find: jest.fn((query: any) => {
    const filter = query?._id?.$in as string[] | undefined;
    const result = filter
      ? componentsStore.filter((c) => filter.map(String).includes(String(c._id)))
      : componentsStore;
    return { exec: jest.fn().mockResolvedValue(result) } as any;
  }),
  updateOne: jest.fn((filter: any, pipeline: any[]) => {
    const id = String(filter._id);
    const found = componentsStore.find((c) => String(c._id) === id);
    if (found) {
      const setStage = pipeline.find((p) => p.$set);
      if (setStage) Object.assign(found, setStage.$set);
    }
    return Promise.resolve({ acknowledged: true });
  }),
} as any;

// Mock Incident Model (constructor + static methods)
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

// Mock IncidentUpdate Model (constructor + static find)
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
    incidentUpdatesStore.filter((u) => String(u.incidentId) === String(query.incidentId)),
  ),
}));

describe('IncidentsService (unit)', () => {
  let service: IncidentsService;

  beforeEach(async () => {
    componentsStore.length = 0;
    incidentsStore.length = 0;
    incidentUpdatesStore.length = 0;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: getModelToken(Incident.name), useValue: IncidentModel },
        { provide: getModelToken(IncidentUpdate.name), useValue: IncidentUpdateModel },
        { provide: getModelToken(Component.name), useValue: componentModel },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
  });

  it('create() should create an incident, update component statuses, and save initial incident update', async () => {
    const compAId = oid();
    const compBId = oid();
    const compA = { _id: compAId, id: compAId, status: ComponentStatus.OPERATIONAL } as any;
    const compB = { _id: compBId, id: compBId, status: ComponentStatus.OPERATIONAL } as any;
    componentsStore.push(compA, compB);

    const req = {
      title: 'Outage',
      description: 'API down',
      affectedComponents: [
        { id: String(compA._id), status: ComponentStatus.MAJOR },
        { id: String(compB._id), status: ComponentStatus.DEGRADED },
      ],
    } as any;

    const incident = await service.create(req);

    expect(incident).toBeDefined();
    expect(incidentsStore.length).toBe(1);
    expect(incident.title).toBe('Outage');

    expect(componentModel.updateOne).toHaveBeenCalledTimes(2);
    expect(componentsStore.find((c) => String(c._id) === String(compA._id))!.status).toBe(
      ComponentStatus.MAJOR,
    );
    expect(componentsStore.find((c) => String(c._id) === String(compB._id))!.status).toBe(
      ComponentStatus.DEGRADED,
    );

    expect(incidentUpdatesStore.length).toBe(1);
    const initUpdate = incidentUpdatesStore[0];
    expect(initUpdate.type).toBe(IncidentUpdateType.CREATED);
    expect(initUpdate.statusUpdate?.to).toBe(IncidentStatus.INVESTIGATING);
    expect(initUpdate.componentStatusUpdates).toHaveLength(2);
    const ids = initUpdate.componentStatusUpdates.map((u: any) => String(u.id));
    expect(ids).toEqual(expect.arrayContaining([String(compA._id), String(compB._id)]));
  });

  it('createIncidentUpdate() with status RESOLVED sets affected components to OPERATIONAL and records updates', async () => {
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

    const update = await service.createIncidentUpdate(req);

    expect(update.type).toBe(IncidentUpdateType.RESOLVED);
    expect(update.statusUpdate?.to).toBe(IncidentStatus.RESOLVED);
    expect(componentsStore[0].status).toBe(ComponentStatus.OPERATIONAL);
    expect(update.componentStatusUpdates).toEqual([
      {
        id: String(comp._id),
        from: ComponentStatus.MAJOR,
        to: ComponentStatus.OPERATIONAL,
      },
    ]);
  });
});
