export interface StatusUpdate {
  from: string | null;
  to: string;
}

export interface ImpactUpdate {
  from: string | null;
  to: string;
}

export interface ComponentStatusUpdate {
  id: string;
  from: string;
  to: string;
}

export interface Update {
  _id: string;
  incidentId: string;
  description?: string;
  type: string;
  statusUpdate?: StatusUpdate;
  impactUpdate?: ImpactUpdate;
  componentStatusUpdates?: ComponentStatusUpdate[];
  createdAt: string;
  updatedAt: string;
}
