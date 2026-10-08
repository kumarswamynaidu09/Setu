import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, BookOpen, Building2 } from 'lucide-react';
import type { Role } from '../types';

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
    <div className="max-w-md mx-auto py-12 px-4 font-body">
      
      {/* 1-Click Evaluator Demo Sign-In (Nothing Style) */}
      <div className="bg-zinc-950 text-white p-6 rounded-3xl border border-zinc-800 shadow-md mb-6 font-mono">
        <div className="flex items-center gap-2 mb-2">
          <span className="glyph-dot glyph-dot-pulse" />
          <div className="nothing-label text-[10px] text-zinc-400">
            QUICK ACCESS // 1-CLICK DEMO ACCOUNTS
          </div>
        </div>
        <p className="text-xs text-zinc-400 mb-4 font-normal">
          Instant sign-in for SevaFirst 2026 evaluators:
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => handleQuickLogin('teacher')}
            disabled={loading}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-2xl text-left transition-all hover:border-red-500 focus-visible:ring-2"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 mb-1">
              <BookOpen className="w-3 h-3" />
              <span>TEACHER</span>
            </div>
            <div className="text-xs font-bold text-white truncate">Anita Sharma</div>
            <div className="text-[10px] text-zinc-400">Class 6 Science</div>
          </button>

          <button
            onClick={() => handleQuickLogin('coordinator')}
            disabled={loading}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-2xl text-left transition-all hover:border-red-500 focus-visible:ring-2"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 mb-1">
              <Building2 className="w-3 h-3" />
              <span>COORDINATOR</span>
            </div>
            <div className="text-xs font-bold text-white truncate">Dr. Sunita Rao</div>
            <div className="text-[10px] text-zinc-400">School In-Charge</div>
          </button>
        </div>
      </div>

      {/* Main Login/Register Form */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100 font-mono">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h1 className="text-lg font-bold font-heading">
            {isRegister ? 'Register Educator' : 'Teacher Sign In'}
          </h1>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="nothing-label text-[10px] text-red-500 hover:underline"
          >
            {isRegister ? 'SIGN IN' : 'NEW ACCOUNT'}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 mb-4 rounded-xl bg-red-950/20 border border-red-500/80 text-red-600 dark:text-red-400 text-xs font-bold"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="nothing-label block text-zinc-500 dark:text-zinc-400 mb-1">
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Anita Sharma"
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
              />
            </div>
          )}

          <div>
            <label className="nothing-label block text-zinc-500 dark:text-zinc-400 mb-1">
              OFFICIAL EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher.anita@setu.edu.in"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="nothing-label block text-zinc-500 dark:text-zinc-400 mb-1">
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
            />
          </div>

          {isRegister && (
            <div>
              <label className="nothing-label block text-zinc-500 dark:text-zinc-400 mb-1">
                ROLE
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
              >
                <option value="teacher">Class Teacher</option>
                <option value="coordinator">School Accessibility Coordinator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 nothing-btn-primary text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{loading ? 'PLEASE WAIT...' : isRegister ? 'CREATE ACCOUNT' : 'SIGN IN'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
