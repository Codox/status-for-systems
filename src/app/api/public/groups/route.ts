import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/mongodb';
import { Group } from '../../models/Group';

export async function GET() {
  try {
    await getDatabaseConnection();
    
    const groups = await Group.find({})
      // .populate('id name status description lastChecked')
      .select('name description components')
      .lean();

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
} 