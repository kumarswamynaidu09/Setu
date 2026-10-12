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
        badgeText="Teacher Workspace"
        badgeVariant="mint"
      >
        <button
          onClick={() => navigate('classes')}
          className="btn-civic-secondary text-xs py-2 px-3.5 rounded-lg font-semibold"
        >
          <Plus className="w-4 h-4 text-[#0D7377]" />
          <span>New Class</span>
        </button>
        <button
          onClick={() => navigate('lesson-editor', { classId: selectedClassId })}
          className="btn-civic-secondary text-xs py-2 px-3.5 rounded-lg font-semibold"
        >
          <BookOpen className="w-4 h-4 text-[#0D7377]" />
          <span>Add Lesson</span>
        </button>
      </PageHeader>

      {/* Start Live Session Workspace Card — Bright Crisp White Card */}
      <div className="civic-card p-6 md:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] border border-[#BCE3DC] flex items-center justify-center text-[#0D7377]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Launch Live Classroom
              </h2>
              <p className="text-xs text-slate-600">
                Core Workflow: Select your class and lesson plan, then start live speech captioning
              </p>
            </div>
          </div>

          <span className="badge-saffron text-xs shrink-0 font-bold">
            6-Character Room Code Generated Automatically
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Class Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              1. Select Assigned Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-[#0D7377] focus:bg-white transition-colors"
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
            <label className="text-xs font-bold text-slate-800">
              2. Select Lesson Plan (Multimodal)
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-[#0D7377] focus:bg-white transition-colors"
            >
              {lessons.map(l => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.sections?.length || 0} Sections with descriptions)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleStartLiveClass}
            disabled={starting}
            className="w-full sm:w-auto btn-civic-primary py-3 px-8 text-sm rounded-xl font-bold shadow-sm disabled:opacity-50"
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
        <div className="civic-card p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0D7377]" />
              <h3 className="font-bold text-base text-slate-900">
                Active Classes ({classes.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('classes')}
              className="text-xs text-[#0D7377] hover:underline font-bold"
            >
              Manage Classes
            </button>
          </div>

          <div className="space-y-3">
            {classes.map(cls => (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {cls.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {cls.grade} Section {cls.section} • {cls.subject}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    navigate('lesson-editor', { classId: cls.id });
                  }}
                  className="btn-civic-secondary text-xs py-1 px-3 rounded-lg font-semibold"
                >
                  Add Lesson
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lessons Library Card */}
        <div className="civic-card p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0D7377]" />
              <h3 className="font-bold text-base text-slate-900">
                Lesson Repository ({lessons.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('lesson-editor')}
              className="text-xs text-[#0D7377] hover:underline font-bold"
            >
              New Lesson
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map(lsn => (
              <div
                key={lsn.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {lsn.title}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {lsn.subject} • {lsn.grade} • {lsn.sections?.length || 0} Sections
                  </div>
                </div>

                <button
                  onClick={() => navigate('lesson-editor', { lesson: lsn })}
                  className="text-xs text-[#0D7377] font-bold hover:underline"
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
