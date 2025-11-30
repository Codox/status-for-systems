import { NextResponse } from 'next/server';
import componentsService from '@/lib/services/components.service';

export async function GET() {
  try {
    const components = await componentsService.getUngrouped();
    
    return NextResponse.json(components, { status: 200 });
  } catch (error) {
    console.error('Error fetching ungrouped components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ungrouped components' },
      { status: 500 }
    );
  }
}
