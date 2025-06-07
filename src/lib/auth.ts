import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AuthUser {
  permission: 'upload' | 'view';
  exp: number;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    
    // Check if token is expired
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

export function getAuthFromRequest(request: NextRequest): AuthUser | null {
  const authCookie = request.cookies.get('auth-token');
  
  if (!authCookie?.value) {
    return null;
  }
  
  return verifyToken(authCookie.value);
}

export function hasUploadPermission(user: AuthUser | null): boolean {
  return user?.permission === 'upload';
}

export function hasViewPermission(user: AuthUser | null): boolean {
  return user?.permission === 'upload' || user?.permission === 'view';
}

export function createToken(permission: 'upload' | 'view'): string {
  const sessionDuration = parseInt(process.env.SESSION_DURATION || '168'); // Default 7 days
  const expiresIn = sessionDuration * 60 * 60; // Convert hours to seconds
  
  return jwt.sign(
    { 
      permission,
      exp: Math.floor(Date.now() / 1000) + expiresIn
    },
    process.env.JWT_SECRET!
  );
} 