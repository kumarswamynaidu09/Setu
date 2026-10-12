import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { BridgeMotif } from '../components/BridgeMotif';
import type { CoordinatorMetrics, User } from '../types';
import {
  Building2,
  Users,
  Radio,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Calendar
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <PageHeader
        title={metrics?.sample_school_name || 'PM SHRI Govt Model High School, Shamshabad'}
        subtitle={`District: ${metrics?.district || 'Ranga Reddy'} • State: ${metrics?.state || 'Telangana'} • Coordinator: ${user?.full_name || 'Dr. Sunita Rao'}`}
        badgeText="Institutional Oversight & Accessibility Governance"
        badgeVariant="navy"
      />

      {/* Aggregate Usage Metrics (Zero Child Profiling) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="civic-card p-5 bg-white dark:bg-[#142738] shadow-xs space-y-1">
          <div className="text-xs font-bold text-[#526575] dark:text-[#9BB0C1]">
            Authorized Teachers
          </div>
          <div className="text-2xl font-extrabold text-[#19324A] dark:text-white">
            {metrics?.total_teachers || teachers.length || 6}
          </div>
          <div className="text-[11px] text-[#0A625D] font-semibold">
            All schools certified
          </div>
        </div>

        <div className="civic-card p-5 bg-white dark:bg-[#142738] shadow-xs space-y-1">
          <div className="text-xs font-bold text-[#526575] dark:text-[#9BB0C1]">
            Inclusive Classes
          </div>
          <div className="text-2xl font-extrabold text-[#19324A] dark:text-white">
            {metrics?.total_classes || 8}
          </div>
          <div className="text-[11px] text-[#526575]">
            Class 6 to 10
          </div>
        </div>

        <div className="civic-card p-5 bg-white dark:bg-[#142738] shadow-xs space-y-1">
          <div className="text-xs font-bold text-[#526575] dark:text-[#9BB0C1]">
            Multimodal Lessons
          </div>
          <div className="text-2xl font-extrabold text-[#19324A] dark:text-white">
            {metrics?.total_lessons || 12}
          </div>
          <div className="text-[11px] text-[#0A625D] font-semibold">
            With tactile descriptions
          </div>
        </div>

        <div className="civic-card p-5 bg-white dark:bg-[#142738] shadow-xs space-y-1">
          <div className="text-xs font-bold text-[#526575] dark:text-[#9BB0C1]">
            Delivered Live Sessions
          </div>
          <div className="text-2xl font-extrabold text-[#19324A] dark:text-white">
            {metrics?.total_live_sessions || 24}
          </div>
          <div className="text-[11px] text-[#526575]">
            Cumulative this academic year
          </div>
        </div>
      </div>

      {/* Aggregate Accessibility Pathway Usage Distribution */}
      <div className="civic-card p-6 bg-white dark:bg-[#142738] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0A625D]" />
            <h3 className="font-bold text-base text-[#19324A] dark:text-white">
              Accessibility Feature Adoption (Aggregate School Data)
            </h3>
          </div>
          <span className="badge-mint text-xs">
            Anonymized Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F7F9F8] dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E] space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#19324A] dark:text-white">
              <span>Read (Captions)</span>
              <span className="text-[#0A625D]">88%</span>
            </div>
            <div className="w-full bg-[#D8E2DC] h-2 rounded-full overflow-hidden">
              <div className="bg-[#0A625D] h-full rounded-full" style={{ width: '88%' }} />
            </div>
            <p className="text-[11px] text-[#526575]">Preferred for noise & hearing needs</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9F8] dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E] space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#19324A] dark:text-white">
              <span>Listen (Audio TTS)</span>
              <span className="text-[#0A625D]">72%</span>
            </div>
            <div className="w-full bg-[#D8E2DC] h-2 rounded-full overflow-hidden">
              <div className="bg-[#0A625D] h-full rounded-full" style={{ width: '72%' }} />
            </div>
            <p className="text-[11px] text-[#526575]">Low vision & auditory learners</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9F8] dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E] space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#19324A] dark:text-white">
              <span>Respond (AAC)</span>
              <span className="text-[#B07822]">45%</span>
            </div>
            <div className="w-full bg-[#D8E2DC] h-2 rounded-full overflow-hidden">
              <div className="bg-[#B07822] h-full rounded-full" style={{ width: '45%' }} />
            </div>
            <p className="text-[11px] text-[#526575]">Speech and shy student questions</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9F8] dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E] space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#19324A] dark:text-white">
              <span>Follow (Steps)</span>
              <span className="text-[#0A625D]">81%</span>
            </div>
            <div className="w-full bg-[#D8E2DC] h-2 rounded-full overflow-hidden">
              <div className="bg-[#0A625D] h-full rounded-full" style={{ width: '81%' }} />
            </div>
            <p className="text-[11px] text-[#526575]">Structured cognitive support</p>
          </div>
        </div>
      </div>

      {/* Teachers Roster */}
      <div className="civic-card p-6 bg-white dark:bg-[#142738] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0A625D]" />
            <h3 className="font-bold text-base text-[#19324A] dark:text-white">
              Authorized Teaching Faculty
            </h3>
          </div>
        </div>

        <div className="divide-y divide-[#E6ECE8] dark:divide-[#1F364C]">
          {teachers.map((t) => (
            <div key={t.id} className="py-3.5 flex items-center justify-between text-sm">
              <div>
                <div className="font-bold text-[#19324A] dark:text-white">
                  {t.full_name}
                </div>
                <div className="text-xs text-[#526575]">
                  {t.email}
                </div>
              </div>
              <span className="badge-mint text-xs">
                Active Staff
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
