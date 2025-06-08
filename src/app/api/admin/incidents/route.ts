import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '../../lib/auth';
import Incident from '../../models/Incident';

const INCIDENT_STATUS = ['investigating', 'identified', 'monitoring', 'resolved'] as const;
const INCIDENT_IMPACT = ['none', 'minor', 'major', 'critical'] as const;

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResponse = await adminAuthMiddleware(request);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const impact = searchParams.get('impact');

  try {
    let query: any = {};
    
    if (status && INCIDENT_STATUS.includes(status as any)) {
      query.status = status;
    }
    
    if (impact && INCIDENT_IMPACT.includes(impact as any)) {
      query.impact = impact;
    }

    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(incidents);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
} 