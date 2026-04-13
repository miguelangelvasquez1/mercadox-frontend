'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { UserRole } from '@/lib/types/auth.types';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    token: null,
  });

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('mercadox_token');
    const role  = localStorage.getItem('mercadox_role') as UserRole | null;
    if (token && role) {
      setAuth({ isAuthenticated: true, role, token });
    }
  }, []);

  const login = (token: string, role: UserRole) => {
    localStorage.setItem('mercadox_token', token);
    localStorage.setItem('mercadox_role', role);
    setAuth({ isAuthenticated: true, role, token });
  };

  const logout = () => {
    localStorage.removeItem('mercadox_token');
    localStorage.removeItem('mercadox_role');
    setAuth({ isAuthenticated: false, role: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}