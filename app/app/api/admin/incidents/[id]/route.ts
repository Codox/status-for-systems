import { NextResponse } from 'next/server';
import incidentsService from '@/lib/services/incidents.service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const incident = await incidentsService.getIncident(id);

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(incident, { status: 200 });
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}
