'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  authenticated: boolean;
  permission: 'upload' | 'view' | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    permission: null,
    loading: true,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      
      setAuthState({
        authenticated: data.authenticated,
        permission: data.permission || null,
        loading: false,
      });
    } catch {
      setAuthState({
        authenticated: false,
        permission: null,
        loading: false,
      });
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'logout' }),
      });
      
      setAuthState({
        authenticated: false,
        permission: null,
        loading: false,
      });
      
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasUploadPermission = () => {
    return authState.authenticated && authState.permission === 'upload';
  };

  const hasViewPermission = () => {
    return authState.authenticated && (authState.permission === 'upload' || authState.permission === 'view');
  };

  return {
    ...authState,
    logout,
    hasUploadPermission,
    hasViewPermission,
    checkAuthStatus,
  };
} 