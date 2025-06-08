import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '../../lib/auth';
import { Component, COMPONENT_STATUS } from '../../models/Component';

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResponse = await adminAuthMiddleware(request);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    let query = {};
    if (status && COMPONENT_STATUS.includes(status as any)) {
      query = { status };
    }

    const components = await Component.find(query)
      .sort({ updatedAt: -1 })
      .limit(100);

    return NextResponse.json(components);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
} 