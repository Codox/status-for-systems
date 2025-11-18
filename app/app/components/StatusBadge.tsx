import { ComponentStatus } from '@/lib/utils/status.utils';

interface StatusBadgeProps {
  status: ComponentStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<ComponentStatus, { bg: string; text: string; icon: string; label: string }> = {
    operational: {
      bg: 'bg-green-100 dark:bg-green-950/30',
      text: 'text-green-800 dark:text-green-300',
      icon: 'bg-green-500',
      label: 'Operational'
    },
    under_maintenance: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      text: 'text-blue-800 dark:text-blue-300',
      icon: 'bg-blue-500',
      label: 'Under Maintenance'
    },
    degraded: {
      bg: 'bg-yellow-100 dark:bg-yellow-950/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: 'bg-yellow-500',
      label: 'Degraded'
    },
    partial: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      text: 'text-orange-800 dark:text-orange-300',
      icon: 'bg-orange-500',
      label: 'Partial Outage'
    },
    major: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-800 dark:text-red-300',
      icon: 'bg-red-500',
      label: 'Major Outage'
    },
    down: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-800 dark:text-red-300',
      icon: 'bg-red-600',
      label: 'Down'
    }
  };

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-2 h-2',
      gap: 'gap-1.5'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-2.5 h-2.5',
      gap: 'gap-2'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-3 h-3',
      gap: 'gap-2'
    }
  };

  const config = statusConfig[status];
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${sizeClass.gap} ${sizeClass.container} ${config.bg} ${config.text} rounded-full font-medium`}>
      {showIcon && <span className={`${sizeClass.icon} rounded-full ${config.icon}`}></span>}
      <span>{config.label}</span>
    </span>
  );
}
