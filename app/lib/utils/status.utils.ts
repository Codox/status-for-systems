export type ComponentStatus = 'operational' | 'under_maintenance' | 'degraded' | 'partial' | 'major';

interface ComponentWithStatus {
  status: string;
}

/**
 * Gets the highest severity status from a list of components.
 * Severity order: operational/under_maintenance (0) < degraded (1) < partial (2) < major (3)
 * 
 * @param components - Array of components with status property
 * @returns The status with the highest severity
 */
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
