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
    // Get component counts by status
    const componentCounts = await Component.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get group counts by status
    const groupCounts = await Group.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get incident counts by status and impact
    const incidentCounts = await Incident.aggregate([
      {
        $group: {
          _id: {
            status: '$status',
            impact: '$impact'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get active incidents (not resolved)
    const activeIncidents = await Incident.find({
      status: { $ne: 'resolved' }
    })
    .sort({ createdAt: -1 })
    .select('title status impact createdAt affectedSystems');

    // Get recent incidents (last 5)
    const recentIncidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status impact createdAt affectedSystems');

    // Get recent component updates with status changes
    const recentComponentUpdates = await Component.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name status updatedAt');

    // Get system health overview
    const systemHealth = {
      components: {
        total: await Component.countDocuments(),
        operational: await Component.countDocuments({ status: 'operational' }),
        degraded: await Component.countDocuments({ status: 'degraded' }),
        outage: await Component.countDocuments({ status: 'outage' }),
        maintenance: await Component.countDocuments({ status: 'maintenance' })
      },
      groups: {
        total: await Group.countDocuments(),
        operational: await Group.countDocuments({ status: 'operational' }),
        degraded: await Group.countDocuments({ status: 'degraded' }),
        outage: await Group.countDocuments({ status: 'outage' }),
        maintenance: await Group.countDocuments({ status: 'maintenance' })
      },
      incidents: {
        total: await Incident.countDocuments(),
        active: await Incident.countDocuments({ status: { $ne: 'resolved' } }),
        resolved: await Incident.countDocuments({ status: 'resolved' })
      }
    };

    return NextResponse.json({
      systemHealth,
      componentCounts,
      groupCounts,
      incidentCounts,
      activeIncidents,
      recentActivity: {
        incidents: recentIncidents,
        componentUpdates: recentComponentUpdates
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 