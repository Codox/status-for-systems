import { NextResponse } from 'next/server';
import groupsService from '@/lib/services/groups.service';
import { validateRequest } from '@/lib/utils/validation.utils';
import { CreateGroupRequest } from '@/lib/requests/create-group.request';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(CreateGroupRequest, body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Create group
    const group = await groupsService.create({
      name: data.name,
      description: data.description,
    });
    
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
