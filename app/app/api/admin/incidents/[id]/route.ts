import { NextResponse } from 'next/server';
import incidentsService from '@/lib/services/incidents.service';
import { validateRequest } from '@/lib/utils/validation.utils';
import { UpdateIncidentRequest } from '@/lib/requests/update-incident.request';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(UpdateIncidentRequest, body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Update incident
    const incident = await incidentsService.updateIncident(id, {
      title: data.title,
      description: data.description,
      status: data.status,
      impact: data.impact,
      affectedComponents: data.affectedComponents,
    });

    return NextResponse.json(incident, { status: 200 });
  } catch (error) {
    console.error('Error updating incident:', error);
    
    // Handle not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}
