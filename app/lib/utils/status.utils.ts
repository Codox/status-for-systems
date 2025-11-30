import { ComponentStatus } from '@/lib/constants/status.constants';

interface ComponentWithStatus {
  status: string;
}

export function getGroupHighestSeverityStatus(components: ComponentWithStatus[]): ComponentStatus {
  if (components.length === 0) return 'operational';

  const severityMap: Record<string, number> = {
    'operational': 0,
    'under_maintenance': 1,
    'degraded': 2,
    'partial': 3,
    'major': 4,
  };

  let highestStatus: ComponentStatus = 'operational';
  let highestSeverity = 0;

  for (const component of components) {
    const severity = severityMap[component.status] ?? 0;
    if (severity > highestSeverity) {
      highestSeverity = severity;
      highestStatus = component.status as ComponentStatus;
    }
  }

  return highestStatus;
}

export type { ComponentStatus };
