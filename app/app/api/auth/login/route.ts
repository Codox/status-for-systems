import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {getAdminPassword, getJwtSecret, validateRequiredEnvVars} from "@/lib/env-validation";

export async function POST(request: Request) {
  try {
    // Validate required environment variables at runtime
    validateRequiredEnvVars();
    
    const JWT_SECRET = getJwtSecret();
    const ADMIN_PASSWORD = getAdminPassword();
    
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate JWT token with 24 hour expiry
    const token = jwt.sign(
      {
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    return NextResponse.json(
      { token, message: 'Login successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
