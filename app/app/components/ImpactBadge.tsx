interface ImpactBadgeProps {
  impact: 'none' | 'minor' | 'major' | 'critical';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ImpactBadge({ impact, showIcon = true, size = 'md' }: ImpactBadgeProps) {
  const impactConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    none: {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-700 dark:text-zinc-300',
      icon: '○',
      label: 'No Impact'
    },
    minor: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      text: 'text-blue-800 dark:text-blue-300',
      icon: '◔',
      label: 'Minor Impact'
    },
    major: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      text: 'text-orange-800 dark:text-orange-300',
      icon: '◑',
      label: 'Major Impact'
    },
    critical: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-800 dark:text-red-300',
      icon: '●',
      label: 'Critical Impact'
    }
  };

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      gap: 'gap-1'
    },
    md: {
      container: 'px-3 py-1 text-xs',
      gap: 'gap-1.5'
    },
    lg: {
      container: 'px-4 py-2 text-sm',
      gap: 'gap-2'
    }
  };

  const config = impactConfig[impact];
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${sizeClass.gap} ${sizeClass.container} ${config.bg} ${config.text} rounded-full font-medium`}>
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
