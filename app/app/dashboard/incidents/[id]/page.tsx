import Link from 'next/link';
import IncidentUpdateCard from '@/app/components/IncidentUpdateCard';
import IncidentStatusBadge from '@/app/components/IncidentStatusBadge';
import ImpactBadge from '@/app/components/ImpactBadge';
import ComponentStatusBadge from '@/app/components/ComponentStatusBadge';
import { getBaseUrl } from '@/lib/dashboard-config';

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
    const baseUrl = getBaseUrl();
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
    const baseUrl = getBaseUrl();
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
            <IncidentStatusBadge status={incident.status} />
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
                        <ComponentStatusBadge status={component.status as 'operational' | 'under_maintenance' | 'degraded' | 'partial' | 'major'} />
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
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📝</div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">No updates yet</p>
                  <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1">Updates will appear here as the incident progresses</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-zinc-200 to-transparent dark:from-blue-800 dark:via-zinc-700"></div>
                  
                  <div className="space-y-6">
                    {updates.map((update) => (
                      <IncidentUpdateCard
                        key={update._id}
                        update={update}
                        affectedComponents={incident.affectedComponents}
                        formatDateTime={formatDateTime}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
