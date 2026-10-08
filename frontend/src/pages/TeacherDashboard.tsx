import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { ClassRoom, Lesson, LiveSession } from '../types';
import {
  Radio,
  BookOpen,
  Plus,
  Users,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle
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
      setError('Please select a class to start the session.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-slate-100">
      
      {/* Top Welcome & Quick Action Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Inclusive Classroom Layer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.teacher.welcome}, {user?.full_name || 'Teacher'}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Start a live classroom session to broadcast live captions, spoken audio descriptions, and receive instant AAC student responses.
          </p>
        </div>

        {/* Start Live Session Widget */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 w-full md:w-auto min-w-[320px] space-y-3">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Ready to Teach
          </div>

          <div>
            <label htmlFor="class-select" className="text-xs text-slate-300 block mb-1">
              Classroom:
            </label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.subject})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lesson-select" className="text-xs text-slate-300 block mb-1">
              Lesson Material:
            </label>
            <select
              id="lesson-select"
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {lessons.map(l => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-300 font-medium">{error}</p>
          )}

          <button
            onClick={handleStartLiveClass}
            disabled={starting || classes.length === 0}
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-600 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{starting ? 'Initializing Session...' : t.teacher.startLiveBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Classes & Prepared Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Classes List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>{t.teacher.activeClasses}</span>
            </h2>
            <button
              onClick={() => navigate('classes')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Class</span>
            </button>
          </div>

          <div className="space-y-3">
            {classes.map(c => (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedClassId === c.id
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-400 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
                onClick={() => setSelectedClassId(c.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {c.name}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {c.grade}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Subject: {c.subject}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prepared Accessible Lessons */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span>{t.teacher.lessonLibrary}</span>
            </h2>
            <button
              onClick={() => navigate('lesson-editor', { classId: selectedClassId })}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.teacher.createLesson}</span>
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map(l => (
              <div
                key={l.id}
                className={`p-5 rounded-2xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-blue-300 ${
                  selectedLessonId === l.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                      {l.grade} • {l.subject}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 font-semibold">
                      Accessible (4 Sections)
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {l.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {l.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate('lesson-editor', { lesson: l })}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Edit / Add Alt
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLessonId(l.id);
                      handleStartLiveClass();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Sessions Audit Log */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{t.teacher.recentSessions}</span>
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
            {history.slice(0, 5).map(s => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                    Room {s.room_code}
                  </span>
                  <span className="text-slate-400 ml-2">
                    {new Date(s.started_at).toLocaleDateString()} {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {s.is_active ? 'Live Now' : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
