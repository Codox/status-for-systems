import { Suspense } from "react";
import StatusDashboard from "@/components/StatusDashboard";

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

interface Incident {
  _id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'critical' | 'major' | 'minor' | 'none';
  affectedComponents: { _id: string; name: string; status: string }[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

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

async function getActiveIncidents(): Promise<Incident[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${apiUrl}/public/incidents`, {
      next: { revalidate: 30 }, // Revalidate every 30 seconds
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch incidents: ${response.statusText}`);
    }

    const data = await response.json();
    // Filter out resolved incidents to show only active ones
    return data.filter((incident: Incident) => incident.status !== 'resolved');
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
}

// Data fetching function
async function getHomeData() {
  try {
    const [groups, activeIncidents] = await Promise.all([
      getGroups(),
      getActiveIncidents()
    ]);
    return { groups, activeIncidents, error: null };
  } catch (error) {
    return { groups: null, activeIncidents: null, error };
  }
}

// Main server component that fetches data and renders the client component
export default async function Home() {
  const { groups, activeIncidents, error } = await getHomeData();
  return <StatusDashboard groups={groups} activeIncidents={activeIncidents} error={error} />;
}
