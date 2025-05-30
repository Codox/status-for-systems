import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
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
  components: Component[];
}

async function getGroups(): Promise<Group[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/groups`, {
    next: { revalidate: 0 }, // Revalidate every 30 seconds
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

  console.log(groups);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.id} className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {group.name}
              </h3>
              {group.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {group.description}
                </p>
              )}
            </div>
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