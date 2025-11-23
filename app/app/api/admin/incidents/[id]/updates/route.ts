import { NextResponse } from 'next/server';
import incidentsService from '@/lib/services/incidents.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updates = await incidentsService.getIncidentUpdates(id);

    return NextResponse.json(updates, { status: 200 });
  } catch (error) {
    console.error('Error fetching incident updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident updates' },
      { status: 500 }
    );
  }
}
