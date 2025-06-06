import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth-token');
  const path = request.nextUrl.pathname;
  
  // Allow access to login page and API routes
  if (path === '/login' || path.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Allow access to static files and Next.js internals
  if (path.startsWith('/_next') || path.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  // Check if user has any authentication token
  if (!authCookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET!) as any;
    
    // Check for upload paths - requires upload permission
    if (path.startsWith('/upload') && decoded.permission !== 'upload') {
      return NextResponse.redirect(new URL('/login?error=insufficient_permissions', request.url));
    }
    
    // User has valid token, allow access
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 