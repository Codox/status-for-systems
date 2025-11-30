import { NextResponse } from 'next/server';
import componentsService from '@/lib/services/components.service';
import { validateRequest } from '@/lib/utils/validation.utils';
import { CreateComponentRequest } from '@/lib/requests/create-component.request';

export async function GET() {
  try {
    const components = await componentsService.getComponents();
    
    return NextResponse.json(components, { status: 200 });
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(CreateComponentRequest, body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Create component
    const component = await componentsService.create({
      name: data.name,
      description: data.description,
      status: data.status,
      groups: data.groups,
    });
    
    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error('Error creating component:', error);
    return NextResponse.json(
      { error: 'Failed to create component' },
      { status: 500 }
    );
  }
}
