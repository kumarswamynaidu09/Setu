import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { CoordinatorMetrics, User } from '../types';
import {
  Building2,
  Users,
  Radio,
  BookOpen,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export const CoordinatorPortal: React.FC = () => {
  const { token, user } = useAuth();
  const [metrics, setMetrics] = useState<CoordinatorMetrics | null>(null);
  const [teachers, setTeachers] = useState<User[]>([]);

  useEffect(() => {
    if (!token) return;

    fetch('/api/coordinator/metrics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);

    fetch('/api/coordinator/teachers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTeachers(data || []))
      .catch(console.error);
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-zinc-900 dark:text-zinc-100 font-body">
      
      {/* Header */}
      <div className="bg-zinc-950 text-white p-8 rounded-3xl border border-zinc-800 shadow-md font-mono">
        <div className="flex items-center gap-2 mb-1">
          <span className="glyph-dot" />
          <div className="nothing-label text-[10px] text-zinc-400">
            INSTITUTIONAL OVERSIGHT // COORDINATOR PORTAL
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading">
          {metrics?.sample_school_name || 'PM SHRI Govt Model High School, Shamshabad'}
        </h1>
        <p className="text-xs text-zinc-400 mt-1 font-mono">
          DISTRICT // {metrics?.district || 'RANGAREDDY'} • STATE // {metrics?.state || 'TELANGANA'} • COORDINATOR // {user?.full_name || 'DR. SUNITA RAO'}
        </p>
      </div>

      {/* Operational Metrics Cards (Nothing Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="nothing-label text-[10px] text-zinc-400">
            [ 01 // TEACHERS ]
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            {metrics?.total_teachers || teachers.length || 2}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="nothing-label text-[10px] text-red-500">
            [ 02 // SESSIONS ]
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            {metrics?.total_live_sessions || 1}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="nothing-label text-[10px] text-zinc-400">
            [ 03 // LESSONS ]
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            {metrics?.total_lessons || 1}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="nothing-label text-[10px] text-zinc-400">
            [ 04 // AAC MSGS ]
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            {metrics?.total_questions_handled || 4}
          </div>
        </div>
      </div>

      {/* Teachers Directory */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 font-mono">
          <h2 className="text-sm font-bold font-heading flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <span>ACTIVE TEACHING STAFF ({teachers.length})</span>
          </h2>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono text-xs">
          {teachers.map(t => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-zinc-900 dark:text-white">{t.full_name}</div>
                <div className="text-[11px] text-zinc-400">{t.email}</div>
              </div>
              <span className="nothing-label px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                AUTHORIZED EDUCATOR
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Child Privacy & Data Governance Certification Card */}
      <div className="bg-zinc-100 dark:bg-zinc-900/60 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="nothing-label text-[10px] text-red-500 font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DATA GOVERNANCE // SAFE PILOT PROTOCOL</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
          SETU operates without persistent child identity tracking or facial biometrics. Speech audio is processed in real time and immediately discarded without disk retention.
        </p>
      </div>

    </div>
  );
};
