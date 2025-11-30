import { NextResponse } from 'next/server';
import groupsService from '@/lib/services/groups.service';

export async function GET() {
  try {
    const groups = await groupsService.getGroups();
    
    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}