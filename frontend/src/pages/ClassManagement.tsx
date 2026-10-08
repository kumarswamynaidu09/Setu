import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ClassRoom } from '../types';
import { Plus, Edit2, Trash2, ArrowLeft, BookOpen } from 'lucide-react';

interface ClassManagementProps {
  navigate: (route: string, data?: any) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({ navigate }) => {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Class 6');
  const [subject, setSubject] = useState('General Science');
  const [section, setSection] = useState('A');
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setClasses(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/classes/${editingId}` : '/api/classes';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, grade, subject, section })
      });

      if (res.ok) {
        setIsCreating(false);
        setEditingId(null);
        setName('');
        fetchClasses();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: ClassRoom) => {
    setEditingId(c.id);
    setName(c.name);
    setGrade(c.grade);
    setSubject(c.subject);
    setSection(c.section || 'A');
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchClasses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-zinc-900 dark:text-zinc-100 font-body">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('teacher-dashboard')}
            aria-label="Back to dashboard"
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="nothing-label text-[10px] text-red-500 font-bold">[ ROSTER MANAGEMENT ]</div>
            <h1 className="text-2xl font-bold font-heading">Classrooms</h1>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setName('');
            setIsCreating(!isCreating);
          }}
          className="px-4 py-2 nothing-btn-primary font-mono text-xs font-bold flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isCreating ? 'CANCEL' : '+ NEW CLASS'}</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm font-mono">
          <h2 className="text-base font-bold font-heading mb-4">
            {editingId ? 'Edit Classroom' : 'Create New Classroom'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="nothing-label block text-zinc-500 dark:text-zinc-400 mb-1">
                CLASSROOM NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Class 6 - Section A"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>

            <div>
              <label className="nothing-label block text-zinc-500 dark:text-zinc-400 mb-1">
                GRADE / LEVEL
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              >
                {['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="nothing-label block text-zinc-500 dark:text-zinc-400 mb-1">
                SUBJECT
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. General Science"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>

            <div>
              <label className="nothing-label block text-zinc-500 dark:text-zinc-400 mb-1">
                SECTION
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 nothing-btn-primary text-xs font-bold"
              >
                {loading ? 'SAVING...' : editingId ? 'UPDATE CLASS' : 'CONFIRM CLASS'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {classes.map(c => (
          <div
            key={c.id}
            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="nothing-label text-[10px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                  {c.grade} // SECTION {c.section || 'A'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg"
                    title="Edit Class"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg"
                    title="Delete Class"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h2 className="text-lg font-bold font-heading text-zinc-900 dark:text-white">
                {c.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Subject: {c.subject}
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{c.lesson_count || 0} LESSONS</span>
              </span>
              <button
                onClick={() => navigate('lesson-editor', { classId: c.id })}
                className="font-bold text-red-500 hover:underline"
              >
                + ADD LESSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
