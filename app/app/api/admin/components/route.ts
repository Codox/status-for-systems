import { NextResponse } from 'next/server';
import componentsService from '@/lib/services/components.service';

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
