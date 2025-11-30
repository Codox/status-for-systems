interface ComponentStatusBadgeProps {
  status: 'operational' | 'under_maintenance' | 'degraded' | 'partial' | 'major';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ComponentStatusBadge({ status, showIcon = true, size = 'md' }: ComponentStatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    operational: {
      bg: 'bg-green-100 dark:bg-green-950/30',
      text: 'text-green-800 dark:text-green-300',
      icon: '✓',
      label: 'Operational'
    },
    degraded: {
      bg: 'bg-yellow-100 dark:bg-yellow-950/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: '⚠',
      label: 'Degraded'
    },
    partial: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      text: 'text-orange-800 dark:text-orange-300',
      icon: '◐',
      label: 'Partial Outage'
    },
    major: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-800 dark:text-red-300',
      icon: '✕',
      label: 'Major Outage'
    },
    under_maintenance: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      text: 'text-blue-800 dark:text-blue-300',
      icon: '🔧',
      label: 'Under Maintenance'
    }
  };

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      gap: 'gap-1'
    },
    md: {
      container: 'px-2 py-1 text-xs',
      gap: 'gap-1'
    },
    lg: {
      container: 'px-3 py-1.5 text-sm',
      gap: 'gap-1.5'
    }
  };

  const config = statusConfig[status];
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${sizeClass.gap} ${sizeClass.container} ${config.bg} ${config.text} rounded font-medium`}>
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
