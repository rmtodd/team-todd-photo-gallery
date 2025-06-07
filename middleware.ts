import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth-token');
  const path = request.nextUrl.pathname;
  
  // Allow access to login page (now main page), old login route, and ALL API routes
  if (path === '/' || path === '/login' || path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Allow access to static files and Next.js internals
  if (path.startsWith('/_next') || path.startsWith('/favicon') || path.endsWith('.ico')) {
    return NextResponse.next();
  }
  
  // Check if user has any authentication token
  if (!authCookie?.value) {
    const loginUrl = new URL('/', request.url);
    // Add the original path as a query parameter for redirect after login
    if (path !== '/' && path !== '/gallery') {
      loginUrl.searchParams.set('from', path.slice(1)); // Remove leading slash
    }
    // Use status 303 and add cache-control headers to prevent caching issues
    const response = NextResponse.redirect(loginUrl, { status: 303 });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET!) as { permission: string; exp: number };
    
    // Check if token is expired (additional check beyond JWT's built-in expiration)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      const response = NextResponse.redirect(loginUrl, { status: 303 });
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return response;
    }
    
    // Check for upload paths - requires upload permission
    if (path.startsWith('/upload') && decoded.permission !== 'upload') {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('error', 'insufficient_permissions');
      const response = NextResponse.redirect(loginUrl, { status: 303 });
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return response;
    }
    
    // User has valid token, allow access with no-cache headers for dynamic content
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;
  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('error', 'invalid_token');
    const response = NextResponse.redirect(loginUrl, { status: 303 });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}; 