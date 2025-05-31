import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/mongodb';
import { Group } from '../../models';

export async function GET() {
  try {
    await getDatabaseConnection();
    
    const groups = await Group.find({})
      .populate('components')
      .select('name description status components')
      .lean();

    console.log(groups);

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
} 