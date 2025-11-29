import { NextResponse } from 'next/server';
import componentsService from '@/lib/services/components.service';
import { validateRequest } from '@/lib/utils/validation.utils';
import { UpdateComponentRequest } from '@/lib/requests/update-component.request';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(UpdateComponentRequest, body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Update component
    const component = await componentsService.update(params.id, {
      name: data.name,
      description: data.description,
      groups: data.groups,
    });
    
    return NextResponse.json(component, { status: 200 });
  } catch (error) {
    console.error('Error updating component:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update component' },
      { status: 500 }
    );
  }
}
