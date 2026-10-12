import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { BridgeMotif } from '../components/BridgeMotif';
import { LogIn, BookOpen, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      
      <PageHeader
        title={isRegister ? 'Staff Registration' : 'Teacher & Staff Sign In'}
        subtitle="Access your teacher studio or school coordinator portal to manage classrooms and lessons."
        badgeText="Institutional Portal"
        badgeVariant="navy"
      />

      <div className="civic-card p-8 bg-white dark:bg-[#142738] shadow-sm space-y-6">
        
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-sm font-semibold"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#19324A] dark:text-white mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Smt. Anita Sharma"
                className="w-full p-3 text-sm rounded-xl border border-[#D8E2DC] dark:border-[#25435E] bg-white dark:bg-[#0E1B26]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#19324A] dark:text-white mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher.anita@setu.edu.in"
              className="w-full p-3 text-sm rounded-xl border border-[#D8E2DC] dark:border-[#25435E] bg-white dark:bg-[#0E1B26]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#19324A] dark:text-white mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3 text-sm rounded-xl border border-[#D8E2DC] dark:border-[#25435E] bg-white dark:bg-[#0E1B26]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-civic-primary py-3 text-sm rounded-xl font-bold mt-2 shadow-xs"
          >
            {isRegister ? 'Complete Registration' : 'Sign In to Workspace'}
          </button>
        </form>

        {/* Quick Demo Sign In Buttons for Judges / Evaluators */}
        <div className="pt-4 border-t border-[#E6ECE8] dark:border-[#1F364C] space-y-3">
          <div className="text-xs font-bold text-[#526575] dark:text-[#9BB0C1] uppercase tracking-wider text-center">
            Evaluator One-Click Sign In
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('teacher')}
              className="btn-civic-secondary text-xs py-2 px-3 rounded-xl justify-center font-bold"
            >
              <span>Demo Teacher (Anita)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('coordinator')}
              className="btn-civic-secondary text-xs py-2 px-3 rounded-xl justify-center font-bold"
            >
              <span>Demo Coordinator (Sunita)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
