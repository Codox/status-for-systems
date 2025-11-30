export type ComponentStatus = 'operational' | 'under_maintenance' | 'degraded' | 'partial' | 'major';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type IncidentImpact = 'none' | 'minor' | 'major' | 'critical';

export const COMPONENT_STATUS_CONFIG: Record<ComponentStatus, { color: string; icon: string; label: string }> = {
  operational: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: '✓',
    label: 'Operational'
  },
  degraded: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: '⚠',
    label: 'Degraded'
  },
  partial: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    icon: '◐',
    label: 'Partial Outage'
  },
  major: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: '✕',
    label: 'Major Outage'
  },
  under_maintenance: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: '🔧',
    label: 'Under Maintenance'
  }
};

export const COMPONENT_STATUS_COLORS: Record<ComponentStatus, string> = {
  operational: 'bg-green-500',
  under_maintenance: 'bg-blue-500',
  degraded: 'bg-yellow-500',
  partial: 'bg-orange-500',
  major: 'bg-red-500'
};

export const COMPONENT_STATUS_OPTIONS: ComponentStatus[] = [
  'operational',
  'under_maintenance',
  'degraded',
  'partial',
  'major'
];

export const INCIDENT_STATUS_CONFIG: Record<IncidentStatus, { color: string; label: string }> = {
  investigating: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    label: 'Investigating'
  },
  identified: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    label: 'Identified'
  },
  monitoring: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    label: 'Monitoring'
  },
  resolved: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    label: 'Resolved'
  }
};

export const INCIDENT_STATUS_OPTIONS: IncidentStatus[] = [
  'investigating',
  'identified',
  'monitoring',
  'resolved'
];

export const INCIDENT_IMPACT_CONFIG: Record<IncidentImpact, { color: string; icon: string; label: string }> = {
  none: {
    color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    icon: '○',
    label: 'None'
  },
  minor: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: '◔',
    label: 'Minor'
  },
  major: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    icon: '◑',
    label: 'Major'
  },
  critical: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: '●',
    label: 'Critical'
  }
};

export const INCIDENT_IMPACT_OPTIONS: IncidentImpact[] = [
  'none',
  'minor',
  'major',
  'critical'
];
