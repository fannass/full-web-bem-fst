import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface AdminUser {
  username: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

/** Decode JWT payload and return expiry unix timestamp, or 0 if invalid */
function getTokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp : 0;
  } catch {
    return 0;
  }
}

/** Returns true if token is still valid (not expired) */
function isTokenValid(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (!exp) return false;
  // Add 10s buffer to avoid edge cases
  return Date.now() / 1000 < exp - 10;
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    api.logout();
    setToken(null);
    setUser(null);
  }, []);

  // Initialize from localStorage on mount — check expiry before restoring
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      if (savedToken && savedUser) {
        if (isTokenValid(savedToken)) {
          try {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            api.setAuthToken(savedToken);
          } catch {
            clearAuth();
          }
        } else {
          // Token expired — clear silently
          clearAuth();
        }
      }
    }
    setIsLoading(false);
  }, [clearAuth]);

  // Periodic expiry check every 60 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      if (!isTokenValid(token)) {
        clearAuth();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [token, clearAuth]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const { token, user } = await api.login(username, password);
      setToken(token);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = React.useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
