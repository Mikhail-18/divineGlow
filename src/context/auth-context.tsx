
'use client';

import type { User, UserRole, Seller } from '@/lib/types';
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { sellers as initialSellers } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: Omit<User, 'name'> & { name?: string }, password?: string, sellerId?: string) => boolean;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SELLERS_STORAGE_KEY = 'divine-glow-sellers';

const staticPasswords: Omit<Record<UserRole, string>, 'seller'> = {
    admin: 'admin123',
    warehouse: 'warehouse123',
    cajero: 'cajero123'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('divine-glow-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      const storedSellers = localStorage.getItem(SELLERS_STORAGE_KEY);
      if (storedSellers) {
        setSellers(JSON.parse(storedSellers));
      } else {
        setSellers(initialSellers);
      }

    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
      localStorage.removeItem('divine-glow-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = useCallback((userData: Omit<User, 'name'> & { name?: string }, password?: string, sellerId?: string) => {
    let isAuthenticated = false;
    let userToAuthenticate: User | null = null;

    if (!password) {
       if (user) {
        isAuthenticated = true;
        userToAuthenticate = user;
       }
    } else if (userData.role === 'seller') {
        const seller = sellers.find(s => s.id === sellerId);
        if (seller && seller.password === password) {
            isAuthenticated = true;
            userToAuthenticate = { name: seller.name, role: 'seller' };
        }
    } else {
        const staticPassword = staticPasswords[userData.role as keyof typeof staticPasswords];
        if (staticPassword && staticPassword === password) {
            isAuthenticated = true;
             let userName = 'Usuario';
            if (userData.role === 'admin') userName = 'Admin';
            if (userData.role === 'warehouse') userName = 'Almacenero';
            if (userData.role === 'cajero') userName = 'Cajero';
            userToAuthenticate = { name: userName, role: userData.role };
        }
    }
    
    if (isAuthenticated && userToAuthenticate) {
        localStorage.setItem('divine-glow-user', JSON.stringify(userToAuthenticate));
        setUser(userToAuthenticate);
        return true;
    }

    return false;
  }, [user, sellers]);

  const logout = useCallback(() => {
    localStorage.removeItem('divine-glow-user');
    setUser(null);
  }, []);

  const updatedLogin = (
    userData: Omit<User, 'name'> & { name?: string },
    password?: string,
    sellerId?: string
  ): boolean => {
    let isAuthenticated = false;
    let userToAuthenticate: User | null = null;
  
    if (!password) {
      // This allows re-login from session without password
      if (user) {
        isAuthenticated = true;
        userToAuthenticate = user;
      }
    } else if (userData.role === 'seller') {
      const seller = sellers.find(s => s.id === sellerId);
      if (seller && seller.password === password) {
        isAuthenticated = true;
        userToAuthenticate = { name: seller.name, role: 'seller' };
      }
    } else {
      // For other roles, check against static passwords
      const staticPassword = staticPasswords[userData.role as keyof typeof staticPasswords];
      if (staticPassword && staticPassword === password) {
        isAuthenticated = true;
        let userName = 'Usuario';
        if (userData.role === 'admin') userName = 'Admin';
        if (userData.role === 'warehouse') userName = 'Almacenero';
        if (userData.role === 'cajero') userName = 'Cajero';
        userToAuthenticate = { name: userName, role: userData.role };
      }
    }
  
    if (isAuthenticated && userToAuthenticate) {
      localStorage.setItem('divine-glow-user', JSON.stringify(userToAuthenticate));
      setUser(userToAuthenticate);
      return true;
    }
  
    return false;
  };
  
  const finalLogin = (
    userData: User,
    password?: string,
    sellerId?: string
  ) => {
    let isAuthenticated = false;

    if (!password) {
      if (user) isAuthenticated = true;
    } else if (userData.role === 'seller' && sellerId) {
      const seller = sellers.find(s => s.id === sellerId);
      if (seller && seller.password === password) {
        isAuthenticated = true;
      }
    } else if (userData.role !== 'seller') {
      const staticPassword = staticPasswords[userData.role as keyof typeof staticPasswords];
      if (staticPassword && staticPassword === password) {
        isAuthenticated = true;
      }
    }

    if (isAuthenticated) {
      const userToSet = userData.role === 'seller' 
        ? sellers.find(s => s.id === sellerId)! 
        : userData;
      
      const finalUser = {name: userToSet.name, role: userData.role };

      localStorage.setItem('divine-glow-user', JSON.stringify(finalUser));
      setUser(finalUser);
    }
    return isAuthenticated;
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login: finalLogin, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
