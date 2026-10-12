import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { LogIn, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
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

  const handleDemoSignIn = async (demoRole: 'teacher' | 'coordinator') => {
    setError(null);
    setLoading(true);
    try {
      await quickDemoLogin(demoRole);
      if (demoRole === 'coordinator') {
        navigate('coordinator');
      } else {
        navigate('teacher-dashboard');
      }
    } catch (e) {
      setError('Could not connect to demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      <PageHeader
        title={isRegister ? 'Staff Registration' : 'Teacher & Staff Sign In'}
        subtitle="Access your teacher studio or school coordinator portal to manage inclusive classrooms and lessons."
        badgeText="Institutional Portal"
        badgeVariant="navy"
      />

      {/* Clean White Card with Warm Borders & High Contrast */}
      <div className="ios-card p-6 sm:p-8 bg-white border border-black/[0.06] shadow-sm space-y-6">
        
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Smt. Anita Sharma"
                className="ios-input w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher.anita@setu.edu.in"
              className="ios-input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="ios-input w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-ios-primary py-3.5 text-sm font-bold shadow-md shadow-[#FF6B4A]/20 disabled:opacity-50"
          >
            <span>{isRegister ? 'Complete Registration' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Quick Demo Sign In Buttons for Judges / Evaluators */}
        <div className="pt-6 border-t border-black/[0.06] space-y-3">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">
            Evaluator One-Click Sign In
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoSignIn('teacher')}
              disabled={loading}
              className="min-h-[44px] px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-[#1A1A2E] border border-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Demo Teacher (Anita)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('coordinator')}
              disabled={loading}
              className="min-h-[44px] px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-[#1A1A2E] border border-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#4A90D9]" />
              <span>Demo Coordinator (Sunita)</span>
            </button>
          </div>
        </div>

        {/* Toggle sign in / register */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-[#6B7280] hover:text-[#1A1A2E] font-medium underline underline-offset-4"
          >
            {isRegister ? 'Already have an account? Sign in' : 'Need a staff account? Register here'}
          </button>
        </div>

      </div>
    </div>
  );
};
