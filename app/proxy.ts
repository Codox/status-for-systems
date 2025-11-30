import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { validateRequiredEnvVars, getJwtSecret } from './lib/env-validation';

// Validate required environment variables on module load
validateRequiredEnvVars();

const JWT_SECRET = getJwtSecret();

interface JWTPayload {
  role: string;
  iat: number;
  exp: number;
}

export function proxy(request: NextRequest) {
  // Only apply proxy to admin API routes
  if (!request.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET as string) as JWTPayload;

/*    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }*/

    return NextResponse.next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }
    console.error('Error in admin proxy:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/admin/:path*',
};
