import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
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
    const token = jwt.sign(
      { 
        permission,
        exp: Math.floor(Date.now() / 1000) + (parseInt(process.env.SESSION_DURATION!) * 60 * 60) // Convert hours to seconds
      },
      process.env.JWT_SECRET!
    );
    
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
    const authCookie = request.cookies.get('auth-token');
    
    if (!authCookie?.value) {
      return NextResponse.json({ authenticated: false });
    }
    
    const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET!) as { permission: string };
    
    return NextResponse.json({ 
      authenticated: true, 
      permission: decoded.permission 
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
} 