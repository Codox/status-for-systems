export interface Component {
  _id: string;
  name: string;
  description: string;
  status: 'operational' | 'under_maintenance' | 'degraded' | 'partial' | 'major';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  components: Component[];
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  _id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  affectedComponents: Component[];
  createdAt: string;
  updatedAt: string;
}
