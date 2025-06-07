import { NextRequest, NextResponse } from 'next/server';
import { authRateLimit } from '@/lib/rate-limit';
import { createToken, getAuthFromRequest } from '@/lib/auth';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = authRateLimit(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: 'Too many authentication attempts. Please try again later.',
        resetTime: rateLimitResult.resetTime 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );
  }

  try {
    const { password, action } = await request.json();
    
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/',
      });
      return response;
    }
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    let permission = '';
    
    // Check password and assign permission level
    if (password === process.env.UPLOAD_PASSWORD) {
      permission = 'upload'; // Can upload and view
    } else if (password === process.env.GALLERY_PASSWORD) {
      permission = 'view'; // Can only view
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // Create JWT token
    const token = createToken(permission as 'upload' | 'view');
    
    const response = NextResponse.json({ 
      success: true, 
      permission,
      message: `Logged in with ${permission} access` 
    });
    
    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.SESSION_DURATION!) * 60 * 60, // Convert hours to seconds
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }
    
    return NextResponse.json({ 
      authenticated: true, 
      permission: user.permission 
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
} 