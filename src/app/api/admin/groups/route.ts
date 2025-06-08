import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '../../lib/auth';
import { Group, GROUP_STATUS } from '../../models/Group';

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResponse = await adminAuthMiddleware(request);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    let query = {};
    if (status && GROUP_STATUS.includes(status as any)) {
      query = { status };
    }

    const groups = await Group.find(query)
      .sort({ updatedAt: -1 })
      .limit(100);

    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
} 