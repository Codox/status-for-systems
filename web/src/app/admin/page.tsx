import { fetchWithAuth } from '@/lib/api'
import AdminDashboardClient from './components/AdminDashboardClient'

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

interface Stats {
  totalGroups: number
  totalComponents: number
  activeIncidents: number
  operationalComponents: number
}

interface RecentActivity {
  id: string
  type: 'incident' | 'maintenance' | 'status_change' | 'component_added'
  title: string
  description: string
  timestamp: string
  status?: string
  user?: string
}

interface SystemHealth {
  uptime: string
  responseTime: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}

// Mock data for demonstration purposes
const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'incident',
    title: 'API Gateway Outage',
    description: 'The API Gateway experienced a complete outage',
    timestamp: '2023-06-15T14:30:00Z',
    status: 'resolved'
  },
  {
    id: '2',
    type: 'maintenance',
    title: 'Database Maintenance',
    description: 'Scheduled maintenance on primary database',
    timestamp: '2023-06-14T08:00:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'status_change',
    title: 'Auth Service Status Change',
    description: 'Auth Service changed from degraded to operational',
    timestamp: '2023-06-13T18:45:00Z',
    user: 'admin'
  },
  {
    id: '4',
    type: 'component_added',
    title: 'New Component Added',
    description: 'Added Payment Processing Service to Financial group',
    timestamp: '2023-06-12T11:20:00Z',
    user: 'admin'
  }
]

const mockSystemHealth: SystemHealth = {
  uptime: '15d 7h 23m',
  responseTime: 187, // ms
  cpuUsage: 42, // percentage
  memoryUsage: 68, // percentage
  diskUsage: 57 // percentage
}

async function getInitialData() {
  try {
    // Fetch groups
    const groupsResponse = await fetchWithAuth('/admin/groups')
    const groups: Group[] = await groupsResponse.json()

    // Fetch components
    const componentsResponse = await fetchWithAuth('/admin/components')
    const components: Component[] = await componentsResponse.json()

    // Calculate stats
    const stats: Stats = {
      totalGroups: groups.length,
      totalComponents: components.length,
      activeIncidents: 0, // This would come from an incidents API
      operationalComponents: components.filter(c => c.status === 'operational').length
    }

    return {
      groups,
      components,
      stats,
      recentActivities: mockRecentActivities,
      systemHealth: mockSystemHealth
    }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    // Return empty data on error
    return {
      groups: [],
      components: [],
      stats: {
        totalGroups: 0,
        totalComponents: 0,
        activeIncidents: 0,
        operationalComponents: 0
      },
      recentActivities: mockRecentActivities,
      systemHealth: mockSystemHealth
    }
  }
}

export default async function AdminDashboard() {
  const initialData = await getInitialData()

  return (
    <AdminDashboardClient
      initialGroups={initialData.groups}
      initialComponents={initialData.components}
      initialStats={initialData.stats}
      initialRecentActivities={initialData.recentActivities}
      initialSystemHealth={initialData.systemHealth}
    />
  )
}

