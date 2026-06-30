'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../../types/api';
import { LoginInput } from '../schemas';
import { authService } from '../../../services/auth.service';
import { tokenStore } from '../../../services/api/axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      const refreshToken = tokenStore.getRefreshToken();
      if (refreshToken) {
        const refreshResult = await authService.refresh(refreshToken);
        if (refreshResult.accessToken) {
          const savedUser = localStorage.getItem('user_details');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize session refresh:', error);
      tokenStore.clearTokens();
      localStorage.removeItem('user_details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (input: LoginInput) => {
    const result = await authService.login(input);
    setUser(result.user);
    localStorage.setItem('user_details', JSON.stringify(result.user));
    if (typeof window !== 'undefined') {
      document.cookie = "session_active=true; path=/; max-age=604800; SameSite=Lax";
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user_details');
    if (typeof window !== 'undefined') {
      document.cookie = "session_active=; path=/; max-age=0; SameSite=Lax";
    }
    await authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
