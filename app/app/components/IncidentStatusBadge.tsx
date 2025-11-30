interface IncidentStatusBadgeProps {
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function IncidentStatusBadge({ status, showIcon = true, size = 'md' }: IncidentStatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    investigating: {
      bg: 'bg-yellow-100 dark:bg-yellow-950/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: 'bg-yellow-500',
      label: 'Investigating'
    },
    identified: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      text: 'text-orange-800 dark:text-orange-300',
      icon: 'bg-orange-500',
      label: 'Identified'
    },
    monitoring: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      text: 'text-blue-800 dark:text-blue-300',
      icon: 'bg-blue-500',
      label: 'Monitoring'
    },
    resolved: {
      bg: 'bg-green-100 dark:bg-green-950/30',
      text: 'text-green-800 dark:text-green-300',
      icon: 'bg-green-500',
      label: 'Resolved'
    }
  };

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      iconSize: 'w-2 h-2',
      gap: 'gap-1'
    },
    md: {
      container: 'px-2 py-1 text-xs',
      iconSize: 'w-2 h-2',
      gap: 'gap-1.5'
    },
    lg: {
      container: 'px-3 py-1.5 text-sm',
      iconSize: 'w-2.5 h-2.5',
      gap: 'gap-2'
    }
  };

  const config = statusConfig[status];
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${sizeClass.gap} ${sizeClass.container} ${config.bg} ${config.text} rounded-full font-medium`}>
      {showIcon && <span className={`${sizeClass.iconSize} rounded-full ${config.icon}`}></span>}
      <span>{config.label}</span>
    </span>
  );
}
