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

const STATUS_CONFIG = {
  investigating: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: '🔍',
    label: 'Investigating'
  },
  identified: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    icon: '⚠️',
    label: 'Identified'
  },
  monitoring: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: '👁️',
    label: 'Monitoring'
  },
  resolved: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: '✅',
    label: 'Resolved'
  },
};

const IMPACT_CONFIG = {
  none: {
    color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    icon: '○',
    label: 'None',
    gradient: 'from-zinc-500 to-zinc-600'
  },
  minor: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: '◔',
    label: 'Minor',
    gradient: 'from-blue-500 to-blue-600'
  },
  major: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    icon: '◑',
    label: 'Major',
    gradient: 'from-orange-500 to-orange-600'
  },
  critical: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: '●',
    label: 'Critical',
    gradient: 'from-red-500 to-red-600'
  },
};

const COMPONENT_STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  operational: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: '✓',
    label: 'Operational'
  },
  degraded: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: '⚠',
    label: 'Degraded'
  },
  partial: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    icon: '◐',
    label: 'Partial Outage'
  },
  major: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: '✕',
    label: 'Major Outage'
  },
  under_maintenance: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: '🔧',
    label: 'Under Maintenance'
  },
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
  const [isFABOpen, setIsFABOpen] = useState(false);

  const [description, setDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedImpact, setSelectedImpact] = useState('');
  const [componentUpdates, setComponentUpdates] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [incidentId]);

  const loadData = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const incidentResponse = await fetch(`/api/admin/incidents/${incidentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!incidentResponse.ok) {
        throw new Error('Failed to fetch incident');
      }

      const fetchedIncident = await incidentResponse.json();

      const updatesResponse = await fetch(`/api/admin/incidents/${incidentId}/updates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!updatesResponse.ok) {
        throw new Error('Failed to fetch incident updates');
      }

      const fetchedUpdates = await updatesResponse.json();

      const componentsResponse = await fetch('/api/admin/components', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!componentsResponse.ok) {
        throw new Error('Failed to fetch components');
      }

      const fetchedComponents = await componentsResponse.json();

      setIncident(fetchedIncident);
      setUpdates(fetchedUpdates);
      setAllComponents(fetchedComponents);
      setSelectedStatus(fetchedIncident.status);
      setSelectedImpact(fetchedIncident.impact);

      const initialComponentUpdates: Record<string, string> = {};
      fetchedIncident.affectedComponents.forEach((component: AffectedComponent) => {
        initialComponentUpdates[component._id] = component.status;
      });
      setComponentUpdates(initialComponentUpdates);

      setIsLoading(false);
    } catch (e) {
      if (e instanceof Error && e.message.includes('Authentication token')) {
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

      await loadData();
      setDescription('');
      setIsSaving(false);
    } catch (e) {
      if (e instanceof Error && e.message.includes('Authentication token')) {
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

      await loadData();
      setSelectedStatus('resolved');
      setSelectedImpact('none');
      setIsSaving(false);
    } catch (e) {
      if (e instanceof Error && e.message.includes('Authentication token')) {
        router.push('/admin/login');
        return;
      }

      setError('Failed to resolve incident. Please try again.');
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatUpdateType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString);
    try {
      return date.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return date.toString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin"></div>
          <div className="text-zinc-500 dark:text-zinc-400">Loading incident...</div>
        </div>
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error Loading Incident</h3>
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/admin/incidents')}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Incidents
        </button>
      </div>
    );
  }

  if (!incident) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[incident.status];
  const impactConfig = IMPACT_CONFIG[incident.impact];

  return (
    <div className="space-y-6 pb-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/admin/incidents')}
        className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Incidents
      </button>

      {/* Hero Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              {incident.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <span>Status: {statusConfig.label}</span>
              <span>•</span>
              <span>Impact: {impactConfig.label}</span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Created {formatDate(incident.createdAt)}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Updated {formatDate(incident.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Details Sections */}
      <div className="space-y-6">
        {/* Incident Description Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Incident Description</h2>
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{incident.description}</p>
        </div>

        {/* Affected Components - Full Width */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Affected Components</h3>
          </div>
          {incident.affectedComponents.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">No components affected</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {incident.affectedComponents.map((component) => {
                const statusConfig = COMPONENT_STATUS_CONFIG[component.status] || { color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300', icon: '?', label: component.status };
                return (
                  <div
                    key={component._id}
                    className="group relative p-3.5 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {component.name}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color} shadow-sm whitespace-nowrap`}>
                        <span>{statusConfig.icon}</span>
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

          {/* Updates Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Incident Timeline</h2>
              <span className="ml-auto text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                {updates.length} {updates.length === 1 ? 'Update' : 'Updates'}
              </span>
            </div>

            {/* Add Update Form */}
            {incident.status !== 'resolved' && (
              <div className="mb-8 p-5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Post New Update</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Incident Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border-2 border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="investigating">🔍 Investigating</option>
                      <option value="identified">⚠️ Identified</option>
                      <option value="monitoring">👁️ Monitoring</option>
                      <option value="resolved">✅ Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Impact Level
                    </label>
                    <select
                      value={selectedImpact}
                      onChange={(e) => setSelectedImpact(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border-2 border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="none">○ None</option>
                      <option value="minor">◔ Minor</option>
                      <option value="major">◑ Major</option>
                      <option value="critical">● Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about what's happening with this incident..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border-2 border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {incident.affectedComponents.length > 0 && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      Component Status Updates
                    </label>
                    <div className="space-y-2.5">
                      {incident.affectedComponents.map((affectedComponent) => {
                        const component = allComponents.find((c) => c._id === affectedComponent._id) || affectedComponent;
                        return (
                          <div key={affectedComponent._id} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[140px] truncate">{component.name}</span>
                            <select
                              value={componentUpdates[affectedComponent._id] || affectedComponent.status}
                              onChange={(e) => setComponentUpdates({
                                ...componentUpdates,
                                [affectedComponent._id]: e.target.value,
                              })}
                              className="flex-1 px-3 py-2 text-sm border-2 border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="operational">✓ Operational</option>
                              <option value="degraded">⚠ Degraded</option>
                              <option value="partial">◐ Partial Outage</option>
                              <option value="major">✕ Major Outage</option>
                              <option value="under_maintenance">🔧 Under Maintenance</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={updateIncident}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Post Update</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Updates Timeline */}
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
                    <div key={update._id} className="relative pl-12">
                      {/* Timeline Dot */}
                      <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                        update.type === 'created' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        update.type === 'resolved' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        'bg-gradient-to-br from-zinc-400 to-zinc-500'
                      }`}>
                        {update.type === 'created' ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        ) : update.type === 'resolved' ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>

                      {/* Update Card */}
                      <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                        {/* Timestamp top-left to fill the gap */}
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500 mb-3">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">{formatFullDateTime(update.createdAt)}</span>
                        </div>

                        {update.description && (
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                            {update.description}
                          </p>
                        )}

                        {(update.statusUpdate || update.impactUpdate) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {update.statusUpdate && (
                              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {update.statusUpdate.from && (
                                    <>
                                      <span className="text-zinc-500 dark:text-zinc-500">{update.statusUpdate.from}</span>
                                      <span className="mx-1.5 text-zinc-400 dark:text-zinc-600">→</span>
                                    </>
                                  )}
                                  <span className="text-yellow-700 dark:text-yellow-300">{update.statusUpdate.to}</span>
                                </div>
                              </div>
                            )}
                            {update.impactUpdate && (
                              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {update.impactUpdate.from && (
                                    <>
                                      <span className="text-zinc-500 dark:text-zinc-500">{update.impactUpdate.from}</span>
                                      <span className="mx-1.5 text-zinc-400 dark:text-zinc-600">→</span>
                                    </>
                                  )}
                                  <span className="text-orange-700 dark:text-orange-300">{update.impactUpdate.to}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {update.componentStatusUpdates && update.componentStatusUpdates.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5">
                              <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                              </svg>
                              Component Changes
                            </div>
                            <div className="space-y-2">
                              {update.componentStatusUpdates.map((compUpdate) => {
                                const component = allComponents.find((c) => c._id === compUpdate.id);
                                const fromConfig = COMPONENT_STATUS_CONFIG[compUpdate.from];
                                const toConfig = COMPONENT_STATUS_CONFIG[compUpdate.to];
                                return (
                                  <div key={compUpdate.id} className="flex items-center gap-2 text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 min-w-[100px] truncate">
                                      {component?.name || compUpdate.id}
                                    </span>
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${fromConfig?.color || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                        <span className="font-medium">{compUpdate.from}</span>
                                      </span>
                                      <svg className="w-3 h-3 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${toConfig?.color || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                        <span className="font-medium">{compUpdate.to}</span>
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
      {/* FAB Menu */}
      {incident.status !== 'resolved' && (
        <>
          {/* Backdrop overlay when menu is open */}
          {isFABOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsFABOpen(false)}
            />
          )}

          <div className="fixed bottom-8 right-8 z-50">
            {/* FAB Menu List */}
            {isFABOpen && (
              <div className="absolute bottom-16 right-0 mb-3 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={() => {
                    setIsFABOpen(false);
                    resolveIncident();
                  }}
                  disabled={isSaving}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-200 dark:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-left flex-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Resolving...</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">Please wait</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="text-left flex-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Resolve Incident</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">Mark as resolved</div>
                      </div>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsFABOpen(false);
                    alert('Edit Incident dialog - To be implemented');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Edit Incident</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">Modify incident details</div>
                  </div>
                </button>
              </div>
            )}

            {/* Main FAB Button */}
            <button
              onClick={() => setIsFABOpen(!isFABOpen)}
              className="group relative w-14 h-14 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
              aria-label="Actions menu"
            >
              <svg
                className="w-6 h-6 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6h.01M12 12h.01M12 18h.01" />
              </svg>
              
              {/* Ripple Effect on Hover */}
              <span className="absolute inset-0 rounded-full bg-white dark:bg-zinc-900 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
            </button>
          </div>
        </>
      )}

      </div>
    </div>
  );
}
