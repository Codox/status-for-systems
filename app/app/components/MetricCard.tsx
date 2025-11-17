interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function MetricCard({ title, value, change, trend = 'neutral' }: MetricCardProps) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-zinc-600 dark:text-zinc-400'
  };

  const trendSymbol = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
        {change && (
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {trendSymbol[trend]} {change}
          </span>
        )}
      </div>
    </div>
  );
}
