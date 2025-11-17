interface StatusCardProps {
  title: string;
  status: 'operational' | 'degraded' | 'down';
  uptime?: string;
  responseTime?: string;
}

export default function StatusCard({ title, status, uptime, responseTime }: StatusCardProps) {
  const statusColors = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500'
  };

  const statusText = {
    operational: 'Operational',
    degraded: 'Degraded Performance',
    down: 'Down'
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">{statusText[status]}</span>
        </div>
      </div>
      {(uptime || responseTime) && (
        <div className="flex gap-6 text-sm">
          {uptime && (
            <div>
              <span className="text-zinc-500 dark:text-zinc-500">Uptime: </span>
              <span className="text-zinc-900 dark:text-zinc-100 font-medium">{uptime}</span>
            </div>
          )}
          {responseTime && (
            <div>
              <span className="text-zinc-500 dark:text-zinc-500">Response: </span>
              <span className="text-zinc-900 dark:text-zinc-100 font-medium">{responseTime}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
