import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, UserCheck, Shield, BookOpen, Building2 } from 'lucide-react';
import { Role } from '../types';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, quickDemoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('teacher');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister
      ? { email, password, full_name: fullName, role }
      : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      login(data.access_token, {
        id: data.user_id,
        email,
        full_name: data.full_name,
        role: data.role as Role,
        school_id: data.school_id,
        created_at: new Date().toISOString()
      });

      if (data.role === 'coordinator') {
        navigate('coordinator');
      } else {
        navigate('teacher-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole: 'teacher' | 'coordinator') => {
    setError(null);
    setLoading(true);
    try {
      await quickDemoLogin(targetRole);
      if (targetRole === 'coordinator') {
        navigate('coordinator');
      } else {
        navigate('teacher-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      {/* 1-Click Competition Evaluator Quick Logins */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-3xl mb-8 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-amber-300">
            Quick Demo Accounts (1-Click)
          </h2>
        </div>
        <p className="text-xs text-blue-200 mb-4">
          Instantly sign in as preloaded educators for the SevaFirst review:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickLogin('teacher')}
            disabled={loading}
            className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-left transition-all hover:scale-[1.02] focus-visible:ring-2"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </div>
            <div className="text-xs font-bold truncate">Anita Sharma</div>
            <div className="text-[10px] text-blue-200">Class 6 Science</div>
          </button>

          <button
            onClick={() => handleQuickLogin('coordinator')}
            disabled={loading}
            className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-left transition-all hover:scale-[1.02] focus-visible:ring-2"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Coordinator</span>
            </div>
            <div className="text-xs font-bold truncate">Dr. Sunita Rao</div>
            <div className="text-[10px] text-blue-200">School In-Charge</div>
          </button>
        </div>
      </div>

      {/* Main Login/Register Form */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <h1 className="text-xl font-bold">
            {isRegister ? 'Create Educator Account' : 'Sign In to SETU'}
          </h1>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isRegister ? 'Switch to Sign In' : 'Need an Account?'}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Anita Sharma"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Official Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. teacher.anita@setu.edu.in"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="teacher">Class Teacher</option>
                <option value="coordinator">School Accessibility Coordinator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Please wait...' : isRegister ? 'Register & Enter' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
