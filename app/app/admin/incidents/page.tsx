'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/utils/auth.utils';
import CreateIncidentModal from '@/app/components/CreateIncidentModal';

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

const IMPACT_ICONS = {
  none: '○',
  minor: '◔',
  major: '◑',
  critical: '●',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [showTooltip, setShowTooltip] = useState(false);
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
    // Refresh incidents list after creating a new incident
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
              onClick={() => window.location.href = `/admin/incidents/${incident._id}`}
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${IMPACT_COLORS[incident.impact]}`}>
                    {IMPACT_ICONS[incident.impact]} {incident.impact.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[incident.status]}`}>
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
                <span>Created {formatDate(incident.createdAt)}</span>
                <span>•</span>
                <span>Updated {formatDate(incident.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
              Create New Incident
              <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-900 dark:bg-zinc-100"></div>
            </div>
          )}
          
          {/* FAB Button */}
          <button
            onClick={handleCreateIncident}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="group relative w-14 h-14 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
            aria-label="Create new incident"
          >
            {/* Plus Icon with Animation */}
            <svg
              className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            
            {/* Ripple Effect on Hover */}
            <span className="absolute inset-0 rounded-full bg-white dark:bg-zinc-900 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
          </button>
        </div>
      </div>

      {/* Create Incident Modal */}
      <CreateIncidentModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleIncidentCreated}
      />
    </div>
  );
}
