'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  authenticated: boolean;
  permission: 'upload' | 'view' | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  logout: () => Promise<void>;
  hasUploadPermission: () => boolean;
  hasViewPermission: () => boolean;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const value: AuthContextType = {
    ...authState,
    logout,
    hasUploadPermission,
    hasViewPermission,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 