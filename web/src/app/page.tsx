import { Suspense } from "react";

// Types
interface Component {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  components: Component[];
  createdAt: string;
  updatedAt: string;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "operational":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "✓",
        severity: 0,
        displayText: "Operational"
      };
    case "degraded":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "!",
        severity: 1,
        displayText: "Degraded"
      };
    case "partial":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        icon: "!",
        severity: 2,
        displayText: "Partial Outage"
      };
    case "major":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "×",
        severity: 3,
        displayText: "Major Outage"
      };
    case "under_maintenance":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "⚡",
        severity: 0,
        displayText: "Under Maintenance"
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: "?",
        severity: 0,
        displayText: "Unknown"
      };
  }
};

const getHighestSeverityStatus = (components: Component[]) => {
  return components.reduce((highest, component) => {
    const currentStatus = getStatusStyles(component.status);
    return currentStatus.severity > highest.severity ? currentStatus : highest;
  }, getStatusStyles("operational"));
};

async function getGroups(): Promise<Group[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${apiUrl}/public/groups`, {
      next: { revalidate: 30 }, // Revalidate every 30 seconds
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Unable to Load System Status
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {message}
        </p>
        <p className="text-sm text-gray-500">
          Please try refreshing the page or contact support if the issue persists.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((j) => (
                <div key={j} className="bg-gray-50 rounded-lg p-4">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Service Groups Available
        </h3>
        <p className="text-sm text-gray-600">
          There are currently no service groups to display. This could be because:
        </p>
        <ul className="mt-4 text-sm text-gray-600 space-y-2">
          <li>• The system is being initialized</li>
          <li>• Services are being configured</li>
          <li>• There might be a temporary issue</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          Please check back later or contact support if this persists.
        </p>
      </div>
    </div>
  );
}

export default async function Home() {
  try {
    const groups = await getGroups();

    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
            <p className="mt-2 text-sm text-gray-600">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>

          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center">
              <span className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-800 font-bold">
                ✓
              </span>
              <div className="ml-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  All Systems Operational
                </h2>
                <p className="text-sm text-gray-600">
                  All core services are functioning normally
                </p>
              </div>
            </div>
          </div>

          {/* Service Groups */}
          <Suspense fallback={<LoadingState />}>
            {groups && groups.length > 0 ? (
              <div className="space-y-8 mb-8">
                {groups.map((group) => {
                  const groupStatus = getHighestSeverityStatus(group.components);
                  return (
                    <div key={group._id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className={`mb-4 p-4 rounded-lg ${groupStatus.bg}`}>
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {group.name}
                          </h2>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${groupStatus.text}`}>
                            {groupStatus.icon} {group.components.every(c => c.status === "operational") ? "All Operational" : groupStatus.displayText}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {group.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {group.components.map((component) => {
                          const statusStyles = getStatusStyles(component.status);
                          return (
                            <div
                              key={component._id}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {component.name}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}
                                >
                                  {statusStyles.icon} {component.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {component.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState />
            )}
          </Suspense>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState message={error instanceof Error ? error.message : 'An unexpected error occurred'} />
        </div>
      </main>
    );
  }
}
