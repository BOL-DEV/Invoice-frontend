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
  updateCurrentUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize cached user details from localStorage to prevent role flicker
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('user_details');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored user details:', e);
      }
    }
    return null;
  });

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
      } else {
        // No refresh token exists -> logged out state
        setUser(null);
        localStorage.removeItem('user_details');
        if (typeof window !== 'undefined') {
          document.cookie = "session_active=; path=/; max-age=0; SameSite=Lax";
        }
      }
    } catch (error: unknown) {
      console.warn('Session refresh warning:', (error as Error)?.message);
      const status = (error as { response?: { status?: number } })?.response?.status;
      
      // ONLY clear tokens and wipe session if server explicitly returned 401 / 403 (Token expired/revoked)
      if (status === 401 || status === 403) {
        tokenStore.clearTokens();
        localStorage.removeItem('user_details');
        setUser(null);
        if (typeof window !== 'undefined') {
          document.cookie = "session_active=; path=/; max-age=0; SameSite=Lax";
        }
      } else {
        // Network error / Server 500 / Offline: DO NOT WIPE USER ROLE!
        // Preserve cached user details from localStorage so Admin remains Admin
        const savedUser = localStorage.getItem('user_details');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (_e) {}
        }
      }
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
    
    // Set cookie duration: 7 days if rememberMe, 8 hours (28800s) by default
    const maxAge = input.rememberMe ? 604800 : 28800;
    if (typeof window !== 'undefined') {
      document.cookie = `session_active=true; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUser(null);
    localStorage.removeItem('user_details');
    if (typeof window !== 'undefined') {
      document.cookie = "session_active=; path=/; max-age=0; SameSite=Lax";
    }
    await authService.logout();
  };

  const updateCurrentUser = (updated: User) => {
    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_details', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateCurrentUser,
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
