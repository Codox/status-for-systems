import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const systems = [
  { name: 'API', status: 'operational' },
  { name: 'Database', status: 'operational' },
  { name: 'Authentication', status: 'operational' },
  { name: 'File Storage', status: 'operational' },
];

export default function StatusOverview() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {systems.map((system) => (
            <div
              key={system.name}
              className="relative rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-shrink-0">
                {system.status === 'operational' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : system.status === 'degraded' ? (
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {system.name}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {system.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 