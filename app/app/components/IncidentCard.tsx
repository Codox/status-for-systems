import Link from 'next/link';

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

  const impactConfig: Record<string, { bg: string; text: string; label: string }> = {
    none: {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-700 dark:text-zinc-300',
      label: 'No Impact'
    },
    minor: {
      bg: 'bg-yellow-100 dark:bg-yellow-950/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      label: 'Minor Impact'
    },
    major: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      text: 'text-orange-800 dark:text-orange-300',
      label: 'Major Impact'
    },
    critical: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-800 dark:text-red-300',
      label: 'Critical Impact'
    }
  };

  const statusStyle = statusConfig[status];
  const impactStyle = impactConfig[impact];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Link href={`/dashboard/incidents/${incidentId}`}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs ${statusStyle.bg} ${statusStyle.text} rounded-full font-medium`}>
              <span className={`w-2 h-2 rounded-full ${statusStyle.icon}`}></span>
              <span>{statusStyle.label}</span>
            </span>
            <span className={`inline-flex items-center px-2 py-1 text-xs ${impactStyle.bg} ${impactStyle.text} rounded-full font-medium`}>
              {impactStyle.label}
            </span>
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
          <span>Created: {formatDate(createdAt)}</span>
          <span>Updated: {formatDate(updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
