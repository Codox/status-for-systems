import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '../../lib/auth';
import { Component } from '../../models/Component';
import { Group } from '../../models/Group';
import Incident from '../../models/Incident';

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResponse = await adminAuthMiddleware(request);
  if (authResponse) return authResponse;

  try {
    // Get system health overview
    const systemHealth = {
      components: {
        total: await Component.countDocuments(),
        operational: await Component.countDocuments({ status: { $eq: 'operational' } }),
      },
      groups: {
        total: await Group.countDocuments(),
      },
      incidents: {
        total: await Incident.countDocuments(),
        active: await Incident.countDocuments({ status: { $ne: 'resolved' } }),
      }
    };

    return NextResponse.json({ systemHealth });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 