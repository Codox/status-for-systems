import { NextResponse } from 'next/server';
import groupsService from '@/lib/services/groups.service';
import { validateRequest } from '@/lib/utils/validation.utils';
import { UpdateGroupRequest } from '@/lib/requests/update-group.request';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(UpdateGroupRequest, body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Await params to get the id
    const { id } = await params;

    // Update group
    const group = await groupsService.update(id, {
      name: data.name,
      description: data.description,
      components: data.components,
    });
    
    return NextResponse.json(group, { status: 200 });
  } catch (error) {
    console.error('Error updating group:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}
