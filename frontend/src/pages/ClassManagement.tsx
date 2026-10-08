import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClassRoom } from '../types';
import { Users, Plus, Edit2, Trash2, ArrowLeft, BookOpen, Check } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('teacher-dashboard')}
            aria-label="Back to dashboard"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black">Classroom Management</h1>
            <p className="text-xs text-slate-500">Manage your active classes and enrolled subjects</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setName('');
            setIsCreating(!isCreating);
          }}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel' : 'Add Class'}</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? 'Edit Classroom' : 'Create New Classroom'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Classroom Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Class 6 - Section A"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Grade / Class
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. General Science"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Section
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {loading ? 'Saving...' : editingId ? 'Update Class' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map(c => (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {c.grade} • Section {c.section || 'A'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                    title="Edit Class"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {c.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Subject: {c.subject}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{c.lesson_count || 0} Lessons Prepared</span>
              </span>
              <button
                onClick={() => navigate('lesson-editor', { classId: c.id })}
                className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                + Add Lesson
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
