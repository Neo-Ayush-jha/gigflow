import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (optional: add a /auth/me endpoint to verify)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password) as any;
    // Backend returns user data on successful login
    if (response._id || response.id) {
      const userData: User = {
        _id: response._id || response.id,
        name: response.name,
        email: response.email,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Token ko bhi localStorage mein store kar rahe hain
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // If you have a logout endpoint
    authApi.logout().catch(() => {
      // Ignore errors
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await authApi.register(name, email, password) as any;
    // After registration, log the user in
    if (response._id || response.id) {
      const userData: User = {
        _id: response._id || response.id,
        name: response.name,
        email: response.email,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Token ko bhi localStorage mein store kar rahe hain
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      signup,
      loading,
    }}>
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
