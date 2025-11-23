'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAuthToken } from '@/lib/utils/auth.utils';

interface Component {
  _id: string;
  name: string;
  status: string;
  description?: string;
}

interface AffectedComponent {
  _id: string;
  name: string;
  status: string;
}

interface Incident {
  _id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  affectedComponents: AffectedComponent[];
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

const STATUS_COLORS = {
  investigating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  identified: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  monitoring: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const IMPACT_COLORS = {
  none: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
  minor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  major: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const COMPONENT_STATUS_COLORS: Record<string, string> = {
  operational: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  partial: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  major: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  under_maintenance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params?.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [allComponents, setAllComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [description, setDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedImpact, setSelectedImpact] = useState('');
  const [componentUpdates, setComponentUpdates] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [incidentId]);

  const loadData = async () => {
    console.log('[DEBUG_LOG] Loading incident data for ID:', incidentId);
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('[DEBUG_LOG] Authentication token not found, redirecting to login');
        router.push('/admin/login');
        return;
      }

      console.log('[DEBUG_LOG] Fetching incident details...');
      const incidentResponse = await fetch(`/api/admin/incidents/${incidentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!incidentResponse.ok) {
        throw new Error('Failed to fetch incident');
      }

      const fetchedIncident = await incidentResponse.json();
      console.log('[DEBUG_LOG] Incident fetched:', fetchedIncident.title);

      console.log('[DEBUG_LOG] Fetching incident updates...');
      const updatesResponse = await fetch(`/api/admin/incidents/${incidentId}/updates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!updatesResponse.ok) {
        throw new Error('Failed to fetch incident updates');
      }

      const fetchedUpdates = await updatesResponse.json();
      console.log('[DEBUG_LOG] Updates fetched:', fetchedUpdates.length, 'updates');

      console.log('[DEBUG_LOG] Fetching all components...');
      const componentsResponse = await fetch('/api/admin/components', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!componentsResponse.ok) {
        throw new Error('Failed to fetch components');
      }

      const fetchedComponents = await componentsResponse.json();
      console.log('[DEBUG_LOG] Components fetched:', fetchedComponents.length, 'components');

      setIncident(fetchedIncident);
      setUpdates(fetchedUpdates);
      setAllComponents(fetchedComponents);
      setSelectedStatus(fetchedIncident.status);
      setSelectedImpact(fetchedIncident.impact);

      // Initialize component updates with current statuses
      const initialComponentUpdates: Record<string, string> = {};
      fetchedIncident.affectedComponents.forEach((component: AffectedComponent) => {
        initialComponentUpdates[component._id] = component.status;
      });
      setComponentUpdates(initialComponentUpdates);

      setIsLoading(false);
      console.log('[DEBUG_LOG] Data loading completed successfully');
    } catch (e) {
      console.log('[DEBUG_LOG] Error loading incident data:', e);

      if (e instanceof Error && e.message.includes('Authentication token')) {
        console.log('[DEBUG_LOG] Authentication error detected, redirecting to login');
        router.push('/admin/login');
        return;
      }

      setError(`Failed to load incident details: ${e}`);
      setIsLoading(false);
    }
  };

  const updateIncident = async () => {
    if (description.trim().length === 0) {
      setError('Please provide a description for the update');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('[DEBUG_LOG] Authentication token not found, redirecting to login');
        router.push('/admin/login');
        return;
      }

      const componentUpdatesList = Object.entries(componentUpdates).map(([id, status]) => ({
        id,
        status,
      }));

      const response = await fetch('/api/admin/incidents/updates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incidentId: incidentId,
          status: selectedStatus,
          impact: selectedImpact,
          description: description.trim(),
          componentUpdates: componentUpdatesList,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update incident');
      }

      // Refresh data
      await loadData();
      setDescription('');
      setIsSaving(false);

      // Show success message (you can implement a toast notification here)
      console.log('[DEBUG_LOG] Incident updated successfully');
    } catch (e) {
      console.log('[DEBUG_LOG] Error updating incident:', e);

      if (e instanceof Error && e.message.includes('Authentication token')) {
        console.log('[DEBUG_LOG] Authentication error during incident update, redirecting to login');
        router.push('/admin/login');
        return;
      }

      setError('Failed to update incident. Please try again.');
      setIsSaving(false);
    }
  };

  const resolveIncident = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('[DEBUG_LOG] Authentication token not found, redirecting to login');
        router.push('/admin/login');
        return;
      }

      const componentUpdatesList = incident!.affectedComponents.map((component) => ({
        id: component._id,
        status: 'operational',
      }));

      const response = await fetch('/api/admin/incidents/updates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incidentId: incidentId,
          status: 'resolved',
          impact: 'none',
          description: 'Incident has been resolved.',
          componentUpdates: componentUpdatesList,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve incident');
      }

      // Refresh data
      await loadData();
      setSelectedStatus('resolved');
      setSelectedImpact('none');
      setIsSaving(false);

      console.log('[DEBUG_LOG] Incident resolved successfully');
    } catch (e) {
      console.log('[DEBUG_LOG] Error resolving incident:', e);

      if (e instanceof Error && e.message.includes('Authentication token')) {
        console.log('[DEBUG_LOG] Authentication error during incident resolve, redirecting to login');
        router.push('/admin/login');
        return;
      }

      setError('Failed to resolve incident. Please try again.');
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatUpdateType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-zinc-500 dark:text-zinc-400">Loading incident...</div>
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/admin/incidents')}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Incidents
        </button>
      </div>
    );
  }

  if (!incident) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <button
        onClick={() => router.push('/admin/incidents')}
        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 opacity-70"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            {incident.title}
          </h1>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[incident.status]}`}>
              {incident.status.toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${IMPACT_COLORS[incident.impact]}`}>
              {incident.impact.toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Created: {formatDate(incident.createdAt)} • Last updated: {formatDate(incident.updatedAt)}
          </div>
        </div>
        {incident.status !== 'resolved' && (
          <button
            onClick={resolveIncident}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resolving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Resolve Incident
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Incident Details Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-zinc-50 dark:bg-zinc-800 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Incident Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Description</h3>
            <p className="text-zinc-700 dark:text-zinc-300">{incident.description}</p>
          </div>
          <hr className="border-zinc-200 dark:border-zinc-700" />
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Affected Components</h3>
            {incident.affectedComponents.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">No components affected</p>
            ) : (
              <div className="space-y-2">
                {incident.affectedComponents.map((component) => (
                  <div
                    key={component._id}
                    className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{component.name}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${COMPONENT_STATUS_COLORS[component.status] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                      {component.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Updates Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-zinc-50 dark:bg-zinc-800 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Updates</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Update Form - only show if incident is not resolved */}
          {incident.status !== 'resolved' && (
            <>
              <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Add Update</h3>

                {/* Status and Impact dropdowns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="investigating">Investigating</option>
                      <option value="identified">Identified</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Impact
                    </label>
                    <select
                      value={selectedImpact}
                      onChange={(e) => setSelectedImpact(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="none">None</option>
                      <option value="minor">Minor</option>
                      <option value="major">Major</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about this update"
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Component Statuses */}
                {incident.affectedComponents.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Component Statuses
                    </label>
                    <div className="space-y-2">
                      {incident.affectedComponents.map((affectedComponent) => {
                        const component = allComponents.find((c) => c._id === affectedComponent._id) || affectedComponent;

                        return (
                          <div
                            key={affectedComponent._id}
                            className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-2"
                          >
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{component.name}</div>
                            <select
                              value={componentUpdates[affectedComponent._id] || affectedComponent.status}
                              onChange={(e) => setComponentUpdates({
                                ...componentUpdates,
                                [affectedComponent._id]: e.target.value,
                              })}
                              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                            >
                              <option value="operational">Operational</option>
                              <option value="degraded">Degraded</option>
                              <option value="partial">Partial Outage</option>
                              <option value="major">Major Outage</option>
                              <option value="under_maintenance">Under Maintenance</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Save button */}
                <div className="flex justify-end">
                  <button
                    onClick={updateIncident}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Add Update
                      </>
                    )}
                  </button>
                </div>
              </div>
              <hr className="border-zinc-200 dark:border-zinc-700" />
            </>
          )}

          {/* Updates List */}
          {updates.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">No updates yet</p>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update._id}
                  className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {formatUpdateType(update.type)}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">
                          {formatDate(update.createdAt)}
                        </span>
                      </div>
                      {update.description && (
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">{update.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Status and Impact changes */}
                  <div className="space-y-2">
                    {update.statusUpdate && (
                      <div className="text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Status: </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {update.statusUpdate.from ? `${update.statusUpdate.from} → ` : ''}
                          {update.statusUpdate.to}
                        </span>
                      </div>
                    )}
                    {update.impactUpdate && (
                      <div className="text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Impact: </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {update.impactUpdate.from ? `${update.impactUpdate.from} → ` : ''}
                          {update.impactUpdate.to}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Component status changes */}
                  {update.componentStatusUpdates && update.componentStatusUpdates.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                      <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">Component Updates:</div>
                      <div className="space-y-1">
                        {update.componentStatusUpdates.map((compUpdate) => {
                          const component = allComponents.find((c) => c._id === compUpdate.id);
                          return (
                            <div key={compUpdate.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                              <span className="font-medium">{component?.name || compUpdate.id}</span>
                              {': '}
                              {compUpdate.from} → {compUpdate.to}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
