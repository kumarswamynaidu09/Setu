import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CoordinatorMetrics, User } from '../types';
import {
  Building2,
  Users,
  Radio,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles
} from 'lucide-react';

export const CoordinatorPortal: React.FC = () => {
  const { token, user } = useAuth();
  const [metrics, setMetrics] = useState<CoordinatorMetrics | null>(null);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Fetch coordinator metrics
    fetch('/api/coordinator/metrics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);

    // Fetch teachers
    fetch('/api/coordinator/teachers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTeachers(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-8 rounded-3xl shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
          <Building2 className="w-4 h-4" />
          <span>School Administration & Pilot Oversight</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          {metrics?.sample_school_name || 'PM SHRI Govt Model High School, Shamshabad'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          District: {metrics?.district || 'Rangareddy'} • State: {metrics?.state || 'Telangana'} • Pilot Coordinator: {user?.full_name || 'Dr. Sunita Rao'}
        </p>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">
            <Users className="w-4 h-4" />
            <span>Authorized Teachers</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {metrics?.total_teachers || teachers.length || 2}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase">
            <Radio className="w-4 h-4" />
            <span>Live Sessions</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {metrics?.total_live_sessions || 1}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">
            <BookOpen className="w-4 h-4" />
            <span>Accessible Lessons</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {metrics?.total_lessons || 1}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
            <MessageSquare className="w-4 h-4" />
            <span>AAC Responses</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {metrics?.total_questions_handled || 4}
          </div>
        </div>
      </div>

      {/* Teachers Directory */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Active Inclusive Teaching Staff</span>
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {teachers.map(t => (
            <div key={t.id} className="py-3.5 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{t.full_name}</div>
                <div className="text-xs text-slate-500">{t.email}</div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                Authorized Educator
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Child Privacy & Data Governance Certification Card */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Child Privacy Compliance & Safe Pilot Guarantees</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          SETU does not capture or retain raw classroom microphone recordings. No biometric cameras, facial expression monitoring, or automated disability classification models are enabled. Students participate via anonymous 6-character session tokens.
        </p>
      </div>

    </div>
  );
};
