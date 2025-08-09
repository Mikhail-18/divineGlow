
'use client';

import type { User, UserRole, Seller } from '@/lib/types';
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { sellers as initialSellers } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, password?: string) => boolean;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SELLERS_STORAGE_KEY = 'divine-glow-sellers';
const USER_STORAGE_KEY = 'divine-glow-user';


const staticPasswords: Omit<Record<UserRole, string>, 'seller'> = {
    admin: 'admin123',
    warehouse: 'warehouse123',
    cajero: 'cajero123'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = useCallback((userData: User, password?: string) => {
    let isAuthenticated = false;
    let userToAuthenticate: User | null = null;
    
    if (!password) {
        // This case handles re-authentication on page refresh if user is already in state
        if (user) {
            isAuthenticated = true;
            userToAuthenticate = user;
        }
    } else if (userData.role === 'seller') {
        const storedSellers = localStorage.getItem(SELLERS_STORAGE_KEY);
        const sellers: Seller[] = storedSellers ? JSON.parse(storedSellers) : initialSellers;
        // For sellers, userData.name is the sellerId
        const seller = sellers.find(s => s.id === userData.name);
        if (seller && seller.password === password) {
            isAuthenticated = true;
            userToAuthenticate = { name: seller.name, role: 'seller' };
        }
    } else {
        const staticPassword = staticPasswords[userData.role as keyof typeof staticPasswords];
        if (staticPassword && staticPassword === password) {
            isAuthenticated = true;
            userToAuthenticate = userData;
        }
    }
    
    if (isAuthenticated && userToAuthenticate) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToAuthenticate));
        setUser(userToAuthenticate);
        return true;
    }

    return false;
  }, [user]);


  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);
  
  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
