import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { ComponentStatus } from '@/types/status';

interface Component {
  id: string;
  name: string;
  status: ComponentStatus;
  description?: string;
  lastChecked?: Date;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  status: ComponentStatus;
  components: Component[];
}

async function getGroups(): Promise<Group[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/groups`, {
    next: { revalidate: 30 }, // Revalidate every 30 seconds
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch groups');
  }
  
  return res.json();
}

function StatusIcon({ status }: { status: ComponentStatus }) {
  switch (status) {
    case 'operational':
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    case 'degraded':
      return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
    case 'outage':
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    case 'maintenance':
      return <WrenchScrewdriverIcon className="h-6 w-6 text-blue-500" />;
  }
}

function getStatusColor(status: ComponentStatus) {
  switch (status) {
    case 'operational':
      return 'bg-green-50 border-green-200';
    case 'degraded':
      return 'bg-yellow-50 border-yellow-200';
    case 'outage':
      return 'bg-red-50 border-red-200';
    case 'maintenance':
      return 'bg-blue-50 border-blue-200';
  }
}

function ComponentCard({ component }: { component: Component }) {
  return (
    <div className="relative rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
      <div className="flex-shrink-0">
        <StatusIcon status={component.status} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {component.name}
        </p>
        <p className="text-sm text-gray-500 capitalize">
          {component.status}
        </p>
        {component.description && (
          <p className="text-xs text-gray-400 mt-1">
            {component.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default async function StatusOverview() {
  const groups = await getGroups();

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.id} className="bg-white shadow rounded-lg overflow-hidden">
          <div className={`px-4 py-5 sm:p-6 border-b ${getStatusColor(group.status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {group.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status={group.status} />
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {group.status}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.components.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 