import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import type { ClassRoom, Lesson, LiveSession } from '../types';
import {
  Radio,
  BookOpen,
  Plus,
  Users,
  Play,
  Clock,
  Circle
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-zinc-900 dark:text-zinc-100">
      
      {/* Top Welcome & Quick Action Card in Nothing Industrial Style */}
      <div className="bg-zinc-950 text-white p-8 rounded-3xl border border-zinc-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="nothing-label text-[10px] text-red-500 font-bold mb-1">
            [ INCLUSIVE CLASSROOM LAYER // TEACHER OS ]
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
            {t.teacher.welcome}, {user?.full_name || 'Teacher'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl font-normal">
            Start a live session to broadcast live captions, diagram audio descriptions, and receive instant AAC student responses.
          </p>
        </div>

        {/* Start Live Session Widget */}
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 w-full md:w-auto min-w-[320px] space-y-3 font-mono">
          <div className="nothing-label text-[10px] text-zinc-400">
            SESSION CONFIG
          </div>

          <div>
            <label htmlFor="class-select" className="text-[10px] uppercase text-zinc-400 block mb-1">
              Classroom:
            </label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.subject})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lesson-select" className="text-[10px] uppercase text-zinc-400 block mb-1">
              Lesson Material:
            </label>
            <select
              id="lesson-select"
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {lessons.map(l => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono">{error}</p>
          )}

          <button
            onClick={handleStartLiveClass}
            disabled={starting || classes.length === 0}
            className="w-full py-3 nothing-btn-accent text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{starting ? 'INITIALIZING...' : 'START LIVE SESSION'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Classes & Prepared Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Classes List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-base font-bold font-heading flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" />
              <span>{t.teacher.activeClasses}</span>
            </h2>
            <button
              onClick={() => navigate('classes')}
              className="nothing-label text-[10px] text-red-500 hover:underline flex items-center gap-1 font-bold"
            >
              <Plus className="w-3 h-3" />
              <span>+ CLASS</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {classes.map(c => (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all cursor-pointer font-mono ${
                  selectedClassId === c.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-900 border-red-500 shadow-xs'
                    : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
                onClick={() => setSelectedClassId(c.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">
                    {c.name}
                  </span>
                  <span className="nothing-label text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {c.grade}
                  </span>
                </div>
                <div className="text-[11px] opacity-70 mt-1">
                  Subject: {c.subject}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prepared Accessible Lessons */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-base font-bold font-heading flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-500" />
              <span>{t.teacher.lessonLibrary}</span>
            </h2>
            <button
              onClick={() => navigate('lesson-editor', { classId: selectedClassId })}
              className="px-3 py-1.5 nothing-btn-primary rounded-xl text-xs font-mono font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>+ LESSON</span>
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map(l => (
              <div
                key={l.id}
                className={`p-5 rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  selectedLessonId === l.id ? 'ring-1 ring-red-500' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="nothing-label text-[10px] text-zinc-500">
                      [ {l.grade} // {l.subject} ]
                    </span>
                    <span className="nothing-label text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700">
                      4 SECTIONS
                    </span>
                  </div>
                  <h3 className="font-bold text-base font-heading text-zinc-900 dark:text-white">
                    {l.title}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-1 font-normal">
                    {l.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono">
                  <button
                    onClick={() => navigate('lesson-editor', { lesson: l })}
                    className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLessonId(l.id);
                      handleStartLiveClass();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-red-600 dark:bg-zinc-100 dark:hover:bg-red-600 text-white dark:text-zinc-950 dark:hover:text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>LAUNCH</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Sessions Audit Log */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <h2 className="text-sm font-bold font-heading flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>( RECENT SESSIONS )</span>
          </h2>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono text-xs">
            {history.slice(0, 5).map(s => (
              <div key={s.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    ROOM // {s.room_code}
                  </span>
                  <span className="text-zinc-400 ml-3 text-[11px]">
                    {new Date(s.started_at).toLocaleDateString()} {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`nothing-label px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.is_active
                      ? 'bg-red-500 text-white'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {s.is_active ? 'LIVE' : 'COMPLETED'}
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
