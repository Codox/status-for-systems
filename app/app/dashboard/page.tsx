import OverallStatus from "../components/OverallStatus";
import GroupCard from "../components/GroupCard";
import IncidentCard from "../components/IncidentCard";
import { getDashboardTitle, getDashboardDescription, getBaseUrl } from "../../lib/dashboard-config";
import { Component, Group, Incident } from "../../lib/types/models";

async function getGroups(): Promise<Group[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/public/groups`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
}

async function getActiveIncidents(): Promise<Incident[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/public/incidents?onlyActive=true`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch incidents');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }
}

function calculateOverallStatus(incidents: Incident[]): 'operational' | 'issues' | 'major' {
  // Prioritize incident impact to determine overall status
  if (incidents.length === 0) {
    return 'operational';
  }
  
  // Check for critical or major impact incidents
  const hasCriticalOrMajorIncident = incidents.some(
    incident => incident.impact === 'critical' || incident.impact === 'major'
  );
  
  if (hasCriticalOrMajorIncident) {
    return 'major';
  }
  
  // Any other active incidents (minor or none impact)
  return 'issues';
}

export default async function DashboardPage() {
  const groups = await getGroups();
  const incidents = await getActiveIncidents();
  const overallStatus = calculateOverallStatus(incidents);

  const dashboardTitle = getDashboardTitle();
  const dashboardDescription = getDashboardDescription();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {dashboardTitle}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {dashboardDescription}
          </p>
        </header>

        <div className="space-y-6">
          <OverallStatus status={overallStatus} />

          {incidents.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Active Incidents
              </h2>
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <IncidentCard
                    key={incident._id}
                    incidentId={incident._id}
                    title={incident.title}
                    description={incident.description}
                    status={incident.status}
                    impact={incident.impact}
                    affectedComponents={incident.affectedComponents}
                    createdAt={incident.createdAt}
                    updatedAt={incident.updatedAt}
                  />
                ))}
              </div>
            </section>
          )}

       {/*   <section>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Key Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Requests" value="1.2M" change="12%" trend="up" />
              <MetricCard title="Avg Response Time" value="145ms" change="5%" trend="down" />
              <MetricCard title="Active Users" value="8,432" change="3%" trend="up" />
              <MetricCard title="Error Rate" value="0.02%" change="0.01%" trend="down" />
            </div>
          </section>*/}

          <section>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Service Status
            </h2>
            <div className="space-y-4">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <GroupCard
                    key={group._id}
                    name={group.name}
                    description={group.description}
                    components={group.components}
                  />
                ))
              ) : (
                <p className="text-zinc-600 dark:text-zinc-400">No service groups found.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
