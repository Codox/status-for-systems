import { NextResponse } from 'next/server';
import incidentsService from '@/lib/services/incidents.service';
import { validateRequest } from '@/lib/utils/validation.utils';
import { CreateIncidentUpdateRequest } from '@/lib/requests/create-incident-update.request';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(CreateIncidentUpdateRequest, body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Create incident update
    const incidentUpdate = await incidentsService.createIncidentUpdate({
      incidentId: data.incidentId,
      description: data.description,
      type: data.type,
      status: data.status,
      impact: data.impact,
      componentUpdates: data.componentUpdates,
    });

    return NextResponse.json(incidentUpdate, { status: 201 });
  } catch (error) {
    console.error('Error creating incident update:', error);
    
    // Handle not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create incident update' },
      { status: 500 }
    );
  }
}
