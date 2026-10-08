import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BookOpen,
  Volume2,
  MessageSquare,
  ListOrdered,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  Play,
  Layers,
  Award
} from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { t } = useAccessibility();
  const { quickDemoLogin } = useAuth();

  const handleLaunchTeacherDemo = async () => {
    try {
      await quickDemoLogin('teacher');
      navigate('teacher-dashboard');
    } catch (e) {
      navigate('login');
    }
  };

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center max-w-4xl mx-auto px-4">
        {/* SevaFirst Innovation Challenge 2026 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-bold mb-6 shadow-xs">
          <Award className="w-4 h-4 text-amber-600" />
          <span>SevaFirst Innovation Challenge 2026 • Theme: Swasth & Samavesh Bharat</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          One Classroom.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-teal-600 to-indigo-600">
            Many Ways to Learn.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          SETU is a teacher-led multimodal classroom accessibility layer. One teacher delivers a lesson — students choose whether to <strong className="text-slate-900 dark:text-white">Read</strong>, <strong className="text-slate-900 dark:text-white">Listen</strong>, <strong className="text-slate-900 dark:text-white">Respond</strong>, or <strong className="text-slate-900 dark:text-white">Follow step-by-step</strong>.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleLaunchTeacherDemo}
            className="w-full sm:w-auto px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base focus-visible:ring-4 focus-visible:ring-blue-500"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Launch Teacher Demo</span>
          </button>

          <button
            onClick={() => navigate('student-join')}
            className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base focus-visible:ring-4 focus-visible:ring-teal-500"
          >
            <span>{t.hero.joinClass}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Targeted for mainstream Indian government schools • No child profiling • Works on standard devices
        </p>
      </section>

      {/* The 4 Multimodal Pathways */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Four Simultaneous Accessible Pathways
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base max-w-xl mx-auto">
            Every child learns differently. SETU eliminates single-format barriers without adding extra workload for the teacher.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pathway 1: READ */}
          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center mb-5">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">
              Mode 1
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t.modes.read}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Real-time streaming captions with adjustable typography, high contrast, active section focus, and teacher live corrections.
            </p>
          </div>

          {/* Pathway 2: LISTEN */}
          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-teal-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-5">
              <Volume2 className="w-6 h-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
              Mode 2
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t.modes.listen}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Audio narration of approved lesson text and spoken pedagogical descriptions of diagrams for visually impaired learners.
            </p>
          </div>

          {/* Pathway 3: RESPOND */}
          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-amber-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-5">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
              Mode 3
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t.modes.respond}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Augmentative & Alternative Communication (AAC) cards enabling non-verbal participation with direct teacher inbox feedback.
            </p>
          </div>

          {/* Pathway 4: FOLLOW */}
          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-purple-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center mb-5">
              <ListOrdered className="w-6 h-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-1">
              Mode 4
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t.modes.follow}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Step-by-step concept cards with simplified language toggle, key term highlights, and synchronized teacher tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Realistic Classroom Scenario Spotlight */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-teal-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-teal-300 bg-teal-950/80 px-3 py-1 rounded-full border border-teal-800">
              Classroom Case Scenario
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-4">
              Class 6 Science — The Solar System
            </h3>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Teacher Anita teaches: <em>&ldquo;The Earth revolves around the Sun. One complete revolution takes approximately 365 days.&rdquo;</em>
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <span><strong>Student A</strong> views live captions in high-contrast English/Hindi.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <span><strong>Student B</strong> hears spoken audio descriptions of the planetary orbit diagram.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <span><strong>Student C</strong> taps the AAC card <em>&ldquo;Why do we have day and night?&rdquo;</em> and the teacher receives it instantly.</span>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleLaunchTeacherDemo}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-sm transition-all"
              >
                Experience Demo Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Engineering Principles */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">
              Zero Child Profiling
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Students join anonymously via a simple 6-character room code. No disability disclosure, biometric cameras, or intrusive tracking.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="p-3 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">
              Low-Cost & Low-Bandwidth
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Designed for standard government school laptops and basic student smartphones with local network streaming support.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">
              Teacher-in-the-Loop
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Teacher maintains complete pedagogical authority over captions, corrections, diagrams, and urgent announcements.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
