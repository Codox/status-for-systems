import { NextResponse } from 'next/server';
import componentsService from '@/lib/services/components.service';
import { ComponentStatus } from '@/lib/entities/incident-update.entity';

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
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!body.description || typeof body.description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!body.status || !Object.values(ComponentStatus).includes(body.status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }
    
    // Validate groups if provided
    if (body.groups !== undefined) {
      if (!Array.isArray(body.groups)) {
        return NextResponse.json(
          { error: 'Groups must be an array' },
          { status: 400 }
        );
      }
      
      if (!body.groups.every((g: any) => typeof g === 'string')) {
        return NextResponse.json(
          { error: 'All group IDs must be strings' },
          { status: 400 }
        );
      }
    }
    
    const component = await componentsService.create({
      name: body.name,
      description: body.description,
      status: body.status,
      groups: body.groups,
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
