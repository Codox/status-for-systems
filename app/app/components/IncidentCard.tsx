import Link from 'next/link';
import IncidentStatusBadge from './IncidentStatusBadge';
import ImpactBadge from './ImpactBadge';
import { formatShortDateTime } from '@/lib/utils/date.utils';

interface Component {
  _id: string;
  name: string;
  description: string;
  status: string;
}

interface IncidentCardProps {
  incidentId: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  affectedComponents: Component[];
  createdAt: string;
  updatedAt: string;
}

export default function IncidentCard({
  incidentId,
  title,
  description,
  status,
  impact,
  affectedComponents,
  createdAt,
  updatedAt,
}: IncidentCardProps) {
  return (
    <Link href={`/dashboard/incidents/${incidentId}`}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <IncidentStatusBadge status={status} />
            <ImpactBadge impact={impact} />
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{description}</p>

        {affectedComponents.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Affected Components</h4>
            <div className="flex flex-wrap gap-2">
              {affectedComponents.map((component) => (
                <span
                  key={component._id}
                  className="inline-flex items-center px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded"
                >
                  {component.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
          <span>Created: {formatShortDateTime(createdAt)}</span>
          <span>Updated: {formatShortDateTime(updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
