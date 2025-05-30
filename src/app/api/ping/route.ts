import { NextResponse } from 'next/server';

export async function GET() {
  const response = {
    status: 'success',
    message: 'Pong!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };

  return NextResponse.json(response);
} 