interface OverallStatusProps {
  status: 'operational' | 'issues' | 'major';
}

export default function OverallStatus({ status }: OverallStatusProps) {
  const statusConfig = {
    operational: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-900',
      text: 'text-green-900 dark:text-green-100',
      icon: 'bg-green-500',
      message: 'All Systems Operational'
    },
    issues: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-200 dark:border-yellow-900',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: 'bg-yellow-500',
      message: 'Some Systems Experiencing Issues'
    },
    major: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-900',
      text: 'text-red-900 dark:text-red-100',
      icon: 'bg-red-500',
      message: 'Major System Outage'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-6`}>
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full ${config.icon}`}></div>
        <h2 className={`text-xl font-bold ${config.text}`}>{config.message}</h2>
      </div>
    </div>
  );
}
