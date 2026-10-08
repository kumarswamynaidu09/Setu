import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lesson, LessonSection, ClassRoom } from '../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  Image as ImageIcon,
  Volume2,
  Sparkles,
  BookOpen,
  Check
} from 'lucide-react';

interface LessonEditorProps {
  navigate: (route: string, data?: any) => void;
  initialLesson?: Lesson;
  initialClassId?: string;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  navigate,
  initialLesson,
  initialClassId
}) => {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classId, setClassId] = useState(initialLesson?.class_id || initialClassId || '');
  const [title, setTitle] = useState(initialLesson?.title || '');
  const [subject, setSubject] = useState(initialLesson?.subject || 'General Science');
  const [grade, setGrade] = useState(initialLesson?.grade || 'Class 6');
  const [summary, setSummary] = useState(initialLesson?.summary || '');
  const [sections, setSections] = useState<LessonSection[]>(
    initialLesson?.sections || [
      {
        order_index: 0,
        title: '1. Introduction',
        content_text: '',
        simplified_text: '',
        key_terms: '',
        image_url: '',
        image_alt: '',
        image_pedagogical_description: ''
      }
    ]
  );

  const [importMode, setImportMode] = useState(false);
  const [rawImportText, setRawImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/classes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setClasses(data || []);
        if (!classId && data && data.length > 0) {
          setClassId(data[0].id);
        }
      })
      .catch(console.error);
  }, [classId, token]);

  const handleAddSection = () => {
    const nextIndex = sections.length;
    setSections([
      ...sections,
      {
        order_index: nextIndex,
        title: `${nextIndex + 1}. New Topic`,
        content_text: '',
        simplified_text: '',
        key_terms: '',
        image_url: '',
        image_alt: '',
        image_pedagogical_description: ''
      }
    ]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (index: number, field: keyof LessonSection, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleImportText = async () => {
    if (!rawImportText.trim() || !classId) {
      setError('Please provide text and select a class.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/lessons/import-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class_id: classId,
          title: title || 'Imported Lesson',
          subject,
          grade,
          raw_text: rawImportText,
          language: 'en'
        })
      });

      const data = await res.json();
      if (res.ok) {
        navigate('teacher-dashboard');
      } else {
        throw new Error(data.detail || 'Import failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error during text import');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      setError('Please select a target classroom.');
      return;
    }
    setError(null);
    setLoading(true);

    const payload = {
      class_id: classId,
      title,
      subject,
      grade,
      summary,
      language: 'en',
      sections: sections.map((s, idx) => ({
        ...s,
        order_index: idx,
        simplified_text: s.simplified_text || s.content_text
      }))
    };

    try {
      const url = initialLesson?.id ? `/api/lessons/${initialLesson.id}` : '/api/lessons';
      const method = initialLesson?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not save lesson');
      }

      setSavedSuccess(true);
      setTimeout(() => {
        navigate('teacher-dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-slate-900 dark:text-slate-100">
      
      {/* Header */}
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
            <h1 className="text-2xl font-black">
              {initialLesson ? 'Edit Accessible Lesson' : 'Prepare Accessible Lesson'}
            </h1>
            <p className="text-xs text-slate-500">
              Create multi-format materials with simplified text and spoken diagram descriptions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setImportMode(!importMode)}
          className="px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" />
          <span>{importMode ? 'Step-by-Step Editor' : 'Quick Text Import'}</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {savedSuccess && (
        <div role="status" className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Lesson successfully saved and formatted for accessibility!</span>
        </div>
      )}

      {importMode ? (
        /* Text Import Mode */
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold">Paste Lesson Text or Notes</h2>
          <p className="text-xs text-slate-500">
            Paste your lesson content separated by double line breaks. SETU will structure them into readable accessible sections.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Lesson Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Class 6 Science - Photosynthesis"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Raw Lesson Text</label>
            <textarea
              rows={10}
              value={rawImportText}
              onChange={(e) => setRawImportText(e.target.value)}
              placeholder="Paste lesson paragraphs here..."
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-mono focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={handleImportText}
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
          >
            {loading ? 'Processing Text...' : 'Import & Generate Accessible Sections'}
          </button>
        </div>
      ) : (
        /* Manual Step-by-Step Editor */
        <form onSubmit={handleSaveLesson} className="space-y-6">
          
          {/* Metadata */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">General Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Class 6 Science — The Solar System"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Grade</label>
                <input
                  type="text"
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Class 6"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="General Science"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Brief Overview / Summary</label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key concepts covered in this lesson..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
              />
            </div>
          </div>

          {/* Sequential Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Step-by-Step Concept Sections ({sections.length})</span>
              </h2>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            {sections.map((sec, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    Section {idx + 1}
                  </span>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Section Heading</label>
                  <input
                    type="text"
                    required
                    value={sec.title}
                    onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                    placeholder="e.g. Earth's Revolution and the 365-Day Year"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Main Lesson Text</label>
                  <textarea
                    rows={3}
                    required
                    value={sec.content_text}
                    onChange={(e) => handleSectionChange(idx, 'content_text', e.target.value)}
                    placeholder="Full academic text for this section..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-teal-700 dark:text-teal-400 mb-1">
                      Simplified Explanation (For Follow / Dyslexia Mode)
                    </label>
                    <textarea
                      rows={2}
                      value={sec.simplified_text || ''}
                      onChange={(e) => handleSectionChange(idx, 'simplified_text', e.target.value)}
                      placeholder="Simpler wording with shorter sentences..."
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      Key Vocabulary / Science Terms
                    </label>
                    <textarea
                      rows={2}
                      value={sec.key_terms || ''}
                      onChange={(e) => handleSectionChange(idx, 'key_terms', e.target.value)}
                      placeholder="e.g. Revolution, Orbit, 365 Days, Seasons"
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>

                {/* Educational Diagram & Spoken Description */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Educational Diagram & Audio Description</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Image / Diagram URL</label>
                      <input
                        type="url"
                        value={sec.image_url || ''}
                        onChange={(e) => handleSectionChange(idx, 'image_url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Image Alt Text (Concise)</label>
                      <input
                        type="text"
                        value={sec.image_alt || ''}
                        onChange={(e) => handleSectionChange(idx, 'image_alt', e.target.value)}
                        placeholder="e.g. Diagram of Earth orbiting the Sun"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Pedagogical Spoken Audio Description (for Listen Mode & Visually Impaired Learners)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={sec.image_pedagogical_description || ''}
                      onChange={(e) => handleSectionChange(idx, 'image_pedagogical_description', e.target.value)}
                      placeholder="Describe what visual elements are in the diagram and what scientific concept they illustrate..."
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('teacher-dashboard')}
              className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save & Publish Lesson'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
