import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth-token');
  const path = request.nextUrl.pathname;
  
  // Allow access to login page and ALL API routes
  if (path === '/login' || path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Allow access to static files and Next.js internals
  if (path.startsWith('/_next') || path.startsWith('/favicon') || path.endsWith('.ico')) {
    return NextResponse.next();
  }
  
  // Check if user has any authentication token
  if (!authCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    // Add the original path as a query parameter for redirect after login
    if (path !== '/') {
      loginUrl.searchParams.set('from', path.slice(1)); // Remove leading slash
    }
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET!) as { permission: string; exp: number };
    
    // Check if token is expired (additional check beyond JWT's built-in expiration)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }
    
    // Check for upload paths - requires upload permission
    if (path.startsWith('/upload') && decoded.permission !== 'upload') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'insufficient_permissions');
      return NextResponse.redirect(loginUrl);
    }
    
    // User has valid token, allow access
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'invalid_token');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}; 