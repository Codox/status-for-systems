import { Suspense } from 'react';
import IncidentList from '@/components/incidents/IncidentList';
import StatusOverview from '@/components/dashboard/StatusOverview';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Status Overview Section */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            System Status
          </h1>
          <StatusOverview />
        </div>

        {/* Incidents Section */}
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Recent Incidents
          </h2>
          <Suspense fallback={<div>Loading incidents...</div>}>
            <IncidentList />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
