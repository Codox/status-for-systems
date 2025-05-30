import { Suspense } from 'react';
import IncidentList from '@/components/incidents/IncidentList';
import StatusOverview from '@/components/dashboard/StatusOverview';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">
            System Status Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time status of all systems and services
          </p>
        </div>

        {/* Status Overview Section */}
        <div className="px-4 py-6 sm:px-0">
          <StatusOverview />
        </div>

        {/* Incidents Section */}
        <div className="px-4 py-6 sm:px-0">
          <Suspense fallback={
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          }>
            <IncidentList />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
