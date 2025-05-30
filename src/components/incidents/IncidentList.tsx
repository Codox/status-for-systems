import { format } from 'date-fns';

interface Incident {
  _id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  startTime: string;
  endTime?: string;
}

async function getIncidents(): Promise<Incident[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/incidents`, {
    next: { revalidate: 60 }, // Revalidate every minute
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch incidents');
  }
  
  return res.json();
}

export default async function IncidentList() {
  const incidents = await getIncidents();

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {incidents.map((incident) => (
          <li key={incident._id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {incident.title}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${incident.impact === 'critical' ? 'bg-red-100 text-red-800' :
                        incident.impact === 'major' ? 'bg-orange-100 text-orange-800' :
                        incident.impact === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}`}>
                      {incident.impact}
                    </p>
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      incident.status === 'monitoring' ? 'bg-blue-100 text-blue-800' :
                      incident.status === 'identified' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {incident.status}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {incident.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    Started {format(new Date(incident.startTime), 'MMM d, yyyy h:mm a')}
                    {incident.endTime && ` - Ended ${format(new Date(incident.endTime), 'MMM d, yyyy h:mm a')}`}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 