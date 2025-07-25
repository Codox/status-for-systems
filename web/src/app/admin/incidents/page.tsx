import { fetchWithAuth } from '@/lib/api'
import IncidentsClient from './components/IncidentsClient'

interface Incident {
  _id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'critical' | 'major' | 'minor' | 'none';
  affectedComponents: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

async function getIncidents(): Promise<Incident[]> {
  try {
    const response = await fetchWithAuth('/admin/incidents')
    const data: Incident[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return []
  }
}

export default async function IncidentsPage() {
  const incidents = await getIncidents()

  return <IncidentsClient initialIncidents={incidents} />
}
