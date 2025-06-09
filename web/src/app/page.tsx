// Dummy data for the status dashboard
const systemStatus = {
  overall: "operational",
  lastUpdated: "2024-03-20T10:00:00Z",
  groups: [
    {
      name: "Core Infrastructure",
      description: "Essential services that power the entire platform",
      services: [
        {
          name: "API Gateway",
          description: "Manages and routes all API requests",
          status: "operational",
        },
        {
          name: "Database",
          description: "Primary data storage and retrieval system",
          status: "partial",
        },
      ],
    },
    {
      name: "Authentication & Security",
      description: "Services responsible for user authentication and platform security",
      services: [
        {
          name: "Authentication Service",
          description: "Handles user login, registration, and session management",
          status: "under_maintenance",
        },
        {
          name: "Security Gateway",
          description: "Protects against threats and manages access control",
          status: "operational",
        },
      ],
    },
    {
      name: "Storage & CDN",
      description: "Content delivery and file storage infrastructure",
      services: [
        {
          name: "File Storage",
          description: "Stores and serves user-uploaded files and media",
          status: "major",
        },
        {
          name: "CDN",
          description: "Distributes content globally for faster access",
          status: "degraded",
        },
      ],
    },
  ],
  recentIncidents: [
    {
      id: 1,
      title: "Database Connection Issues",
      status: "resolved",
      date: "2024-03-19T15:30:00Z",
      duration: "45 minutes",
    },
    {
      id: 2,
      title: "API Gateway Latency",
      status: "investigating",
      date: "2024-03-20T09:15:00Z",
      duration: "ongoing",
    },
  ],
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "operational":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "✓",
      };
    case "degraded":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "!",
      };
    case "partial":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        icon: "!",
      };
    case "major":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "×",
      };
    case "under_maintenance":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "⚡",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: "?",
      };
  }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
          <p className="mt-2 text-sm text-gray-600">
            Last updated: {new Date(systemStatus.lastUpdated).toLocaleString()}
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
        <div className="space-y-8 mb-8">
          {systemStatus.groups.map((group) => (
            <div key={group.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {group.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {group.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.services.map((service) => {
                  const statusStyles = getStatusStyles(service.status);
                  return (
                    <div
                      key={service.name}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {service.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}
                        >
                          {statusStyles.icon} {service.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {service.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Incidents
          </h2>
          <div className="space-y-4">
            {systemStatus.recentIncidents.map((incident) => {
              const statusStyles = getStatusStyles(incident.status);
              return (
                <div
                  key={incident.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${statusStyles.bg} ${statusStyles.text}`}
                    >
                      {statusStyles.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {incident.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(incident.date).toLocaleString()} •{" "}
                      {incident.duration}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}
                  >
                    {incident.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
