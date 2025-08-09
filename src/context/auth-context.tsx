'use client';

import type { User, UserRole } from '@/lib/types';
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, password?: string) => boolean;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const passwords: Record<UserRole, string> = {
    admin: 'admin123',
    seller: 'seller123',
    warehouse: 'warehouse123'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('divine-hub-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('divine-hub-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((userData: User, password?: string) => {
    if (password && passwords[userData.role] === password) {
        localStorage.setItem('divine-hub-user', JSON.stringify(userData));
        setUser(userData);
        return true;
    }
    // This allows login without password if it's not provided, for sessions loaded from localStorage
    if (!password && user) {
        return true;
    }
    return false;
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem('divine-hub-user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
