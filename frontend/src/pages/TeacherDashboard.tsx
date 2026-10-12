import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { PageHeader } from '../components/PageHeader';
import { BridgeMotif } from '../components/BridgeMotif';
import type { ClassRoom, Lesson, LiveSession } from '../types';
import {
  Radio,
  BookOpen,
  Plus,
  Users,
  Play,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface TeacherDashboardProps {
  navigate: (route: string, data?: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const { t } = useAccessibility();
  const { joinRoom } = useLiveClassroom();

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [history, setHistory] = useState<LiveSession[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    // Fetch classes
    fetch('/api/classes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClassId(data[0].id);
        }
      })
      .catch(console.error);

    // Fetch lessons
    fetch('/api/lessons', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setLessons(data || []);
        if (data && data.length > 0) {
          setSelectedLessonId(data[0].id);
        }
      })
      .catch(console.error);

    // Fetch history
    fetch('/api/sessions/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setHistory(data || []))
      .catch(console.error);
  }, [token]);

  const handleStartLiveClass = async () => {
    if (!selectedClassId) {
      setError('Please select a class before starting a live session.');
      return;
    }
    setError(null);
    setStarting(true);

    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class_id: selectedClassId,
          lesson_id: selectedLessonId || null
        })
      });

      const sessionData = await res.json();
      if (!res.ok) {
        throw new Error(sessionData.detail || 'Failed to start session');
      }

      joinRoom(sessionData.id, sessionData.room_code, 'teacher', user?.full_name || 'Teacher');
      navigate('teacher-live', { session: sessionData });
    } catch (err: any) {
      setError(err.message || 'Error starting session');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <PageHeader
        title={`Welcome, ${user?.full_name || 'Teacher'}`}
        subtitle="Manage your inclusive classrooms, prepare multimodal lesson plans, and launch live interactive sessions."
        badgeText="Teacher OS • Inclusive Classroom Layer"
        badgeVariant="mint"
      >
        <button
          onClick={() => navigate('classes')}
          className="btn-civic-secondary text-xs py-2 px-3.5 rounded-lg"
        >
          <Plus className="w-4 h-4 text-[#0A625D]" />
          <span>New Class</span>
        </button>
        <button
          onClick={() => navigate('lesson-editor', { classId: selectedClassId })}
          className="btn-civic-secondary text-xs py-2 px-3.5 rounded-lg"
        >
          <BookOpen className="w-4 h-4 text-[#0A625D]" />
          <span>Add Lesson</span>
        </button>
      </PageHeader>

      {/* Start Live Session Workspace Card (Primary Workflow: Choose lesson -> Start class -> Teach) */}
      <div className="civic-card p-6 md:p-8 bg-[#19324A] text-white shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#25435E] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A625D] flex items-center justify-center text-white">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Launch Live Classroom
              </h2>
              <p className="text-xs text-slate-300">
                Core Workflow: Choose lesson → Start class → Teach with captions & audio
              </p>
            </div>
          </div>

          <span className="badge-saffron text-xs shrink-0">
            Room code generated automatically
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#9B1C1C]/40 border border-[#F8B4B4] text-xs text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Class Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200">
              1. Select Assigned Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#142738] border border-[#25435E] text-white text-sm focus:outline-none focus:border-[#0A625D]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.grade} • {c.name} ({c.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Lesson Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200">
              2. Select Lesson Plan (Multimodal)
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#142738] border border-[#25435E] text-white text-sm focus:outline-none focus:border-[#0A625D]"
            >
              {lessons.map(l => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.sections?.length || 0} Sections)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleStartLiveClass}
            disabled={starting}
            className="w-full sm:w-auto btn-civic-primary py-3.5 px-8 text-base rounded-xl font-bold shadow-sm disabled:opacity-50"
          >
            {starting ? (
              <span>Initializing Live Session...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Live Session & Open Teacher Studio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Two Column Layout: Classes on Left, Lessons on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Classes Card */}
        <div className="civic-card p-6 bg-white dark:bg-[#142738] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0A625D]" />
              <h3 className="font-bold text-base text-[#19324A] dark:text-white">
                Active Classes ({classes.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('classes')}
              className="text-xs text-[#0A625D] hover:underline font-semibold"
            >
              Manage Classes
            </button>
          </div>

          <div className="space-y-3">
            {classes.map(cls => (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-[#D8E2DC] dark:border-[#25435E] bg-[#F7F9F8] dark:bg-[#0E1B26] flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-[#19324A] dark:text-white">
                    {cls.name}
                  </div>
                  <div className="text-xs text-[#526575] dark:text-[#9BB0C1] mt-0.5">
                    {cls.grade} Section {cls.section} • {cls.subject}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    navigate('lesson-editor', { classId: cls.id });
                  }}
                  className="btn-civic-secondary text-xs py-1 px-2.5 rounded-lg"
                >
                  Add Lesson
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lessons Library Card */}
        <div className="civic-card p-6 bg-white dark:bg-[#142738] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0A625D]" />
              <h3 className="font-bold text-base text-[#19324A] dark:text-white">
                Multimodal Lesson Repository ({lessons.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('lesson-editor')}
              className="text-xs text-[#0A625D] hover:underline font-semibold"
            >
              New Lesson
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map(lsn => (
              <div
                key={lsn.id}
                className="p-4 rounded-xl border border-[#D8E2DC] dark:border-[#25435E] bg-[#F7F9F8] dark:bg-[#0E1B26] flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-[#19324A] dark:text-white">
                    {lsn.title}
                  </div>
                  <div className="text-xs text-[#526575] dark:text-[#9BB0C1] mt-0.5">
                    {lsn.subject} • {lsn.grade} • {lsn.sections?.length || 0} Sections
                  </div>
                </div>

                <button
                  onClick={() => navigate('lesson-editor', { lesson: lsn })}
                  className="text-xs text-[#0A625D] font-bold hover:underline"
                >
                  Edit Lesson
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
