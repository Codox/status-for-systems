'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/utils/auth.utils';
import CreateIncidentModal from '@/app/components/modals/CreateIncidentModal';
import FABMenu, { FABMenuItem } from '@/app/components/FABMenu';
import { formatRelativeDate } from '@/lib/utils/date.utils';
import { INCIDENT_STATUS_CONFIG, INCIDENT_IMPACT_CONFIG } from '@/lib/constants/status.constants';

interface Component {
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
  affectedComponents: Component[];
  createdAt: string;
  updatedAt: string;
}

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/admin/incidents', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }

      const data = await response.json();
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleIncidentCreated = () => {
    fetchIncidents();
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'active') return incident.status !== 'resolved';
    if (filter === 'resolved') return incident.status === 'resolved';
    return true;
  });

  const stats = {
    total: incidents.length,
    active: incidents.filter(i => i.status !== 'resolved').length,
    critical: incidents.filter(i => i.impact === 'critical').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-zinc-500 dark:text-zinc-400">Loading incidents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Incidents
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Monitor and manage system incidents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Incidents</div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Active</div>
          <div className="text-2xl font-semibold text-orange-600 dark:text-orange-400">{stats.active}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Critical</div>
          <div className="text-2xl font-semibold text-red-600 dark:text-red-400">{stats.critical}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Resolved</div>
          <div className="text-2xl font-semibold text-green-600 dark:text-green-400">{stats.resolved}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800',
          ].join(' ')}
        >
          All ({incidents.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            filter === 'active'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800',
          ].join(' ')}
        >
          Active ({stats.active})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            filter === 'resolved'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800',
          ].join(' ')}
        >
          Resolved ({stats.resolved})
        </button>
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">No incidents found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <div
              key={incident._id}
              onClick={() => router.push(`/admin/incidents/${incident._id}`)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {incident.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    {incident.description}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${INCIDENT_IMPACT_CONFIG[incident.impact].color}`}>
                    {INCIDENT_IMPACT_CONFIG[incident.impact].icon} {incident.impact.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${INCIDENT_STATUS_CONFIG[incident.status].color}`}>
                    {incident.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Affected Components */}
              {incident.affectedComponents.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">Affected Components:</div>
                  <div className="flex flex-wrap gap-2">
                    {incident.affectedComponents.map((component) => (
                      <span
                        key={component._id}
                        className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs"
                      >
                        {component.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                <span>Created {formatRelativeDate(incident.createdAt)}</span>
                <span>•</span>
                <span>Updated {formatRelativeDate(incident.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB Menu */}
      <FABMenu
        items={[
          {
            id: 'create',
            label: 'Create Incident',
            description: 'Report a new incident',
            icon: (
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            onClick: handleCreateIncident,
          },
          {
            id: 'refresh',
            label: 'Refresh',
            description: 'Reload incidents list',
            icon: (
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ),
            onClick: fetchIncidents,
          },
        ]}
      />

      {/* Create Incident Modal */}
      <CreateIncidentModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleIncidentCreated}
      />
    </div>
  );
}
