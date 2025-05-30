import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '../lib/mongodb';
import Incident from '../models/Incident';

export async function GET() {
  try {
    // The connection is already established, we just need to ensure it's ready
    await getDatabaseConnection();
    const incidents = await Incident.find({}).sort({ startTime: -1 });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // The connection is already established, we just need to ensure it's ready
    await getDatabaseConnection();
    const body = await request.json();
    
    const incident = await Incident.create(body);
    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
} 