import Link from 'next/link';

interface Component {
  _id: string;
  name: string;
  description: string;
  status: string;
}

interface Incident {
  _id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  affectedComponents: Component[];
  createdAt: string;
  updatedAt: string;
}

interface StatusUpdate {
  from: string | null;
  to: string;
}

interface ImpactUpdate {
  from: string | null;
  to: string;
}

interface ComponentStatusUpdate {
  id: string;
  from: string;
  to: string;
}

interface Update {
  _id: string;
  incidentId: string;
  description?: string;
  type: string;
  statusUpdate?: StatusUpdate;
  impactUpdate?: ImpactUpdate;
  componentStatusUpdates?: ComponentStatusUpdate[];
  createdAt: string;
  updatedAt: string;
}

async function getIncident(id: string): Promise<Incident | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/incidents/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching incident:', error);
    return null;
  }
}

async function getIncidentUpdates(id: string): Promise<Update[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/incidents/${id}/updates`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching incident updates:', error);
    return [];
  }
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    investigating: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      label: 'Investigating'
    },
    identified: {
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      label: 'Identified'
    },
    monitoring: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      label: 'Monitoring'
    },
    resolved: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      label: 'Resolved'
    }
  };

  const config = statusConfig[status] || statusConfig.investigating;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function ImpactBadge({ impact }: { impact: string }) {
  const impactConfig: Record<string, { color: string; label: string }> = {
    none: {
      color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
      label: 'No Impact'
    },
    minor: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      label: 'Minor Impact'
    },
    major: {
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      label: 'Major Impact'
    },
    critical: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      label: 'Critical Impact'
    }
  };

  const config = impactConfig[impact] || impactConfig.none;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function ComponentStatusBadge({ status }: { status: string }) {
  const componentStatusConfig: Record<string, { color: string; label: string }> = {
    operational: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      label: 'Operational'
    },
    degraded: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      label: 'Degraded'
    },
    partial: {
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      label: 'Partial Outage'
    },
    major: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      label: 'Major Outage'
    },
    under_maintenance: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      label: 'Under Maintenance'
    }
  };

  const config = componentStatusConfig[status] || componentStatusConfig.operational;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function UpdateCard({ update, affectedComponents }: { update: Update; affectedComponents?: Component[] }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          {update.description && (
            <p className="text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              {update.description}
            </p>
          )}
          
          {update.statusUpdate && (
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
              Status changed: {update.statusUpdate.from || 'N/A'} → {update.statusUpdate.to}
            </div>
          )}
          
          {update.impactUpdate && (
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
              Impact changed: {update.impactUpdate.from || 'N/A'} → {update.impactUpdate.to}
            </div>
          )}
          
          {update.componentStatusUpdates && update.componentStatusUpdates.length > 0 && (
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
              <div className="font-medium mb-1">Component status changes:</div>
              {update.componentStatusUpdates.map((compUpdate, idx) => {
                const component = affectedComponents?.find(c => c._id === compUpdate.id);
                return (
                  <div key={idx} className="ml-2">
                    • {component?.name || compUpdate.id}: {compUpdate.from} → {compUpdate.to}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-zinc-500 dark:text-zinc-500">
        {formatDateTime(update.createdAt)}
      </div>
    </div>
  );
}

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = await getIncident(id);
  const updates = await getIncidentUpdates(id);

  if (!incident) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Incident not found or failed to load</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            {incident.title}
          </h1>
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status={incident.status} />
            <ImpactBadge impact={incident.impact} />
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Created: {formatDateTime(incident.createdAt)} • Last updated: {formatDateTime(incident.updatedAt)}
          </div>
        </div>

        <div className="space-y-6">
          {/* Incident Details Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-100 dark:bg-zinc-800 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Incident Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Description
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {incident.description}
                </p>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Affected Components
                </h3>
                {incident.affectedComponents.length === 0 ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No components affected
                  </p>
                ) : (
                  <div className="space-y-2">
                    {incident.affectedComponents.map((component) => (
                      <div
                        key={component._id}
                        className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-800/50"
                      >
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {component.name}
                        </span>
                        <ComponentStatusBadge status={component.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Updates Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-100 dark:bg-zinc-800 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Updates
              </h2>
            </div>
            <div className="p-6">
              {updates.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No updates yet
                </p>
              ) : (
                <div className="space-y-3">
                  {updates.map((update) => (
                    <UpdateCard
                      key={update._id}
                      update={update}
                      affectedComponents={incident.affectedComponents}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
