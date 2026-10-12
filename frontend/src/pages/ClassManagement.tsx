import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ClassRoom } from '../types';
import { Plus, Edit2, Trash2, ArrowLeft, BookOpen, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface ClassManagementProps {
  navigate: (route: string, data?: any) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({ navigate }) => {
  const { token, user } = useAuth();
  const effectiveToken = token || localStorage.getItem('setu_auth_token') || '';

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Class 6');
  const [subject, setSubject] = useState('General Science');
  const [section, setSection] = useState('A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchClasses = async () => {
    if (!effectiveToken) return;
    try {
      const res = await fetch('/api/classes', {
        headers: { 'Authorization': `Bearer ${effectiveToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data || []);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.detail || 'Could not load classes');
      }
    } catch (e: any) {
      setError(e.message || 'Network error fetching classes');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [effectiveToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const url = editingId ? `/api/classes/${editingId}` : '/api/classes';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`
        },
        body: JSON.stringify({ name: name.trim(), grade, subject: subject.trim(), section: section.trim() || 'A' })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setIsCreating(false);
        setEditingId(null);
        setName('');
        setSuccessMsg(editingId ? 'Class updated successfully!' : 'New classroom created successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchClasses();
      } else {
        setError(data.detail || 'Failed to save classroom. Please ensure you are signed in as a teacher.');
      }
    } catch (e: any) {
      setError(e.message || 'Error communicating with server.');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${effectiveToken}` }
      });
      if (res.ok) {
        setSuccessMsg('Class removed.');
        setTimeout(() => setSuccessMsg(null), 2500);
        fetchClasses();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.detail || 'Could not delete class');
      }
    } catch (e: any) {
      setError(e.message || 'Error deleting class');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 bg-[#F7F9F8] min-h-[calc(100vh-4rem)] text-[#19324A]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('teacher-dashboard')}
            aria-label="Back to teacher dashboard"
            className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0A625D]">
              Classroom Roster & Curriculum
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#19324A]">
              My Classrooms
            </h1>
          </div>
        </div>

        <button
          onClick={() => {
            setError(null);
            setSuccessMsg(null);
            if (isCreating) {
              setIsCreating(false);
              setEditingId(null);
            } else {
              setEditingId(null);
              setName('');
              setIsCreating(true);
            }
          }}
          className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
            isCreating
              ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              : 'bg-[#0A625D] hover:bg-[#084F4B] text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel' : '+ Create New Class'}</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div role="status" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Classroom Creation / Edit Form Card */}
      {isCreating && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
          <h2 className="text-lg font-bold text-[#19324A] mb-4">
            {editingId ? 'Edit Classroom Details' : 'Create New Classroom'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Classroom Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Class 6 - Section A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A625D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grade / Level *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A625D]"
              >
                {['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. General Science"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A625D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A625D]"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-[#0A625D] hover:bg-[#084F4B] text-white font-bold disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Saving...' : editingId ? 'Update Class' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map(c => (
          <div
            key={c.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E8F5F2] text-[#0A625D] border border-[#0A625D]/20">
                  {c.grade} • Section {c.section || 'A'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                    title="Edit Class"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-lg font-bold text-[#19324A]">
                {c.name}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Subject: <span className="font-semibold text-slate-800">{c.subject}</span>
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-bold text-[#19324A]">
                <BookOpen className="w-4 h-4 text-[#0A625D]" />
                <span>{c.lesson_count || 0} Lessons Assigned</span>
              </span>
              <button
                onClick={() => navigate('lesson-editor', { classId: c.id })}
                className="font-bold text-[#0A625D] hover:underline"
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
