import StatusBadge from './StatusBadge';
import { getGroupHighestSeverityStatus } from '@/lib/utils/status.utils';

interface Component {
  _id: string;
  name: string;
  description: string;
  status: 'operational' | 'under_maintenance' | 'degraded' | 'partial' | 'major' | 'down';
  createdAt: string;
  updatedAt: string;
}

interface GroupCardProps {
  name: string;
  description: string;
  components: Component[];
}

export default function GroupCard({ name, description, components }: GroupCardProps) {
  const groupStatus = getGroupHighestSeverityStatus(components);
  console.log('Group Status:', groupStatus);
  const statusColors: Record<string, string> = {
    operational: 'bg-green-500',
    under_maintenance: 'bg-blue-500',
    degraded: 'bg-yellow-500',
    partial: 'bg-orange-500',
    major: 'bg-red-500',
  };

  const statusText: Record<string, string> = {
    operational: 'Operational',
    under_maintenance: 'Under Maintenance',
    degraded: 'Degraded Performance',
    partial: 'Partial Outage',
    major: 'Major Outage',
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{name}</h3>
          <StatusBadge status={groupStatus} showIcon={true} size="sm" />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {components.map((component) => (
          <div 
            key={component._id}
            className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {component.name}
                </h4>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${statusColors[component.status]}`}></div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {component.description}
              </p>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {statusText[component.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
