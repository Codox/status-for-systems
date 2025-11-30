interface Component {
  _id: string;
  name: string;
  description?: string;
  status: string;
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

interface IncidentUpdateCardProps {
  update: Update;
  affectedComponents?: Component[];
  formatDateTime: (dateString: string) => string;
}

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

export default function IncidentUpdateCard({ update, affectedComponents, formatDateTime }: IncidentUpdateCardProps) {
  return (
    <div className="relative pl-12">
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
        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{formatDateTime(update.createdAt)}</span>
        </div>

        {update.description && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5">
              <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Update Message
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
              {update.description}
            </p>
          </div>
        )}

        {update.statusUpdate && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5">
              <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Status Update
            </div>
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
          </div>
        )}

        {update.impactUpdate && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5">
              <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Impact Update
            </div>
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
                const component = affectedComponents?.find((c) => c._id === compUpdate.id);
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
  );
}
