
'use client';

import type { User, UserRole, Seller, Cashier } from '@/lib/types';
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { sellers as initialSellers, cashiers as initialCashiers } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, password?: string) => boolean;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SELLERS_STORAGE_KEY = 'divine-glow-sellers';
const CASHIERS_STORAGE_KEY = 'divine-glow-cashiers';
const USER_STORAGE_KEY = 'divine-glow-user';


const staticPasswords: Omit<Record<UserRole, string>, 'seller' | 'cajero'> = {
    admin: 'admin123',
    warehouse: 'warehouse123',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);


  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const storedSellers = localStorage.getItem(SELLERS_STORAGE_KEY);
      setSellers(storedSellers ? JSON.parse(storedSellers) : initialSellers);

      const storedCashiers = localStorage.getItem(CASHIERS_STORAGE_KEY);
      setCashiers(storedCashiers ? JSON.parse(storedCashiers) : initialCashiers);

    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = useCallback((userData: User, password?: string) => {
    let isAuthenticated = false;
    let userToAuthenticate: User | null = null;
    
    if (!password) {
        return false;
    }
    
    // We need to fetch the latest lists from localStorage inside login
    // because the state might not be updated yet if a user was just created.
    const currentSellers: Seller[] = JSON.parse(localStorage.getItem(SELLERS_STORAGE_KEY) || '[]');
    const currentCashiers: Cashier[] = JSON.parse(localStorage.getItem(CASHIERS_STORAGE_KEY) || '[]');

    if (userData.role === 'seller') {
        const seller = currentSellers.find(s => s.id === userData.name); // userData.name is the sellerId
        if (seller && seller.password === password) {
            isAuthenticated = true;
            userToAuthenticate = { name: seller.name, role: 'seller' };
        }
    } else if (userData.role === 'cajero') {
        const cashier = currentCashiers.find(c => c.id === userData.name); // userData.name is the cashierId
        if (cashier && cashier.password === password) {
            isAuthenticated = true;
            userToAuthenticate = { name: cashier.name, role: 'cajero' };
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
  }, []);


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
