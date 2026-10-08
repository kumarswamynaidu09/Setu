import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  quickDemoLogin: (role: 'teacher' | 'coordinator') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('setu_auth_token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('setu_auth_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('setu_auth_token', newToken);
    localStorage.setItem('setu_auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('setu_auth_token');
    localStorage.removeItem('setu_auth_user');
  };

  const quickDemoLogin = async (role: 'teacher' | 'coordinator') => {
    const email = role === 'teacher' ? 'teacher.anita@setu.edu.in' : 'coordinator@setu.edu.in';
    const password = role === 'teacher' ? 'SetuTeacher@2026' : 'SetuAdmin@2026';

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      throw new Error('Quick demo login failed');
    }

    const data = await res.json();
    const newUser: User = {
      id: data.user_id,
      email: email,
      full_name: data.full_name,
      role: data.role as Role,
      school_id: data.school_id,
      created_at: new Date().toISOString()
    };
    login(data.access_token, newUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, login, logout, quickDemoLogin }}>
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
