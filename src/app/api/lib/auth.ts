import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function adminAuthMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { 
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Access"'
        }
      }
    );
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Check against environment variables
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured in environment variables');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  console.log('username', username);
  console.log('password', password);
  console.log('adminUsername', adminUsername);
  console.log('adminPassword', adminPassword);

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { 
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Access"'
        }
      }
    );
  }

  return null; // Continue to the route handler
} 