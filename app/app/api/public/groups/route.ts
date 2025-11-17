import dbConnect from '@/lib/mongodb';
import GroupModel from '@/lib/entities/group.entity';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    
    const groups = await GroupModel.find()
        // .populate('components')
        .exec();
    
    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}