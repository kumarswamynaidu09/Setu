import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import type { ClassRoom, Lesson, LiveSession } from '../types';
import {
  Radio,
  BookOpen,
  Plus,
  Users,
  Play,
  ArrowRight
} from 'lucide-react';

interface TeacherDashboardProps {
  navigate: (route: string, data?: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const { joinRoom } = useLiveClassroom();

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch('/api/classes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setClasses(data || []);
        if (data && data.length > 0) setSelectedClassId(data[0].id);
      })
      .catch(console.error);

    fetch('/api/lessons', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setLessons(data || []);
        if (data && data.length > 0) setSelectedLessonId(data[0].id);
      })
      .catch(console.error);
  }, [token]);

  const handleStartLiveClass = async () => {
    if (!selectedClassId) {
      setError('Please select an assigned class');
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
      if (!res.ok) throw new Error(sessionData.detail || 'Failed to start session');

      joinRoom(sessionData.id, sessionData.room_code, 'teacher', user?.full_name || 'Teacher');
      navigate('teacher-live', { session: sessionData });
    } catch (err: any) {
      setError(err.message || 'Error starting session');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* iOS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Teacher Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Signed in as {user?.full_name || 'Anita Sharma'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('classes')}
            className="btn-ios-secondary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Class</span>
          </button>
          <button
            onClick={() => navigate('lesson-editor', { classId: selectedClassId })}
            className="btn-ios-secondary text-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Add Lesson</span>
          </button>
        </div>
      </div>

      {/* Start Live Session — iOS Hero Card */}
      <div className="ios-card p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Launch Live Classroom
              </h2>
              <p className="text-xs text-slate-500">
                Start real-time speech captioning and step synchronization
              </p>
            </div>
          </div>

          <span className="badge-ios-blue text-xs font-semibold">
            One-Click Setup
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-xs text-red-700 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Assigned Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="ios-input w-full cursor-pointer text-sm font-semibold"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.grade} • {c.name} ({c.subject})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Lesson Plan (with Audio Descriptions)
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="ios-input w-full cursor-pointer text-sm font-semibold"
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
            className="btn-ios-primary w-full sm:w-auto py-3 px-8 text-sm"
          >
            {starting ? 'Connecting...' : 'Start Class & Begin Speech'}
          </button>
        </div>
      </div>

      {/* Roster & Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Classes */}
        <div className="ios-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Classes ({classes.length})</span>
            </h3>
            <button
              onClick={() => navigate('classes')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2">
            {classes.map(cls => (
              <div
                key={cls.id}
                className="p-3.5 rounded-2xl bg-[#F2F2F7] flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-900">{cls.name}</div>
                  <div className="text-xs text-slate-500">{cls.grade} Section {cls.section} • {cls.subject}</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    navigate('lesson-editor', { classId: cls.id });
                  }}
                  className="text-xs text-blue-600 font-semibold"
                >
                  Add Lesson
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lessons */}
        <div className="ios-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Lessons ({lessons.length})</span>
            </h3>
            <button
              onClick={() => navigate('lesson-editor')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              New
            </button>
          </div>

          <div className="space-y-2">
            {lessons.map(lsn => (
              <div
                key={lsn.id}
                className="p-3.5 rounded-2xl bg-[#F2F2F7] flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-900">{lsn.title}</div>
                  <div className="text-xs text-slate-500">{lsn.subject} • {lsn.sections?.length || 0} Sections</div>
                </div>
                <button
                  onClick={() => navigate('lesson-editor', { lesson: lsn })}
                  className="text-xs text-blue-600 font-semibold"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
