import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Volume2,
  MessageSquare,
  ListOrdered,
  ArrowRight,
  ShieldCheck,
  Zap,
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
    <div className="space-y-20 py-10 bg-nothing-grid">
      
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4">
        {/* SevaFirst Innovation Challenge 2026 Badge with Dot Matrix */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] font-bold mb-6 shadow-xs">
          <span className="glyph-dot glyph-dot-pulse" />
          <span>SEVAFIRST 2026 // THEME 03: SWASTH & SAMAVESH BHARAT</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-heading tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.1]">
          One Classroom.<br />
          <span className="text-zinc-400 dark:text-zinc-500 font-normal">
            Many Ways to Learn.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
          SETU is an accessible, teacher-led classroom accessibility layer. One teacher delivers a lesson — students choose whether to <strong className="text-zinc-900 dark:text-white font-semibold">Read</strong>, <strong className="text-zinc-900 dark:text-white font-semibold">Listen</strong>, <strong className="text-zinc-900 dark:text-white font-semibold">Respond</strong>, or <strong className="text-zinc-900 dark:text-white font-semibold">Follow</strong>.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono">
          <button
            onClick={handleLaunchTeacherDemo}
            className="w-full sm:w-auto px-7 py-3.5 nothing-btn-primary text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>LAUNCH TEACHER DEMO</span>
          </button>

          <button
            onClick={() => navigate('student-join')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>JOIN AS STUDENT</span>
            <ArrowRight className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>

        <p className="mt-4 nothing-label text-[10px] text-zinc-400 dark:text-zinc-500">
          DESIGNED FOR INDIAN GOVERNMENT SCHOOLS • ZERO CHILD PROFILING
        </p>
      </section>

      {/* The 4 Multimodal Pathways (Nothing Modular Cards) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="nothing-label text-xs text-red-500 font-bold mb-1">[ MULTIMODAL ACCESS ]</div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-zinc-900 dark:text-white">
            Four Simultaneous Accessible Pathways
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1.5 text-xs sm:text-sm max-w-xl mx-auto">
            Eliminating single-format barriers without increasing teacher preparation workload.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pathway 1: READ */}
          <div className="nothing-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="nothing-label text-[10px] text-zinc-400">( 01 )</span>
              </div>
              <div className="nothing-label text-xs text-red-500 font-bold mb-1">
                MODE // READ
              </div>
              <h3 className="text-lg font-bold font-heading text-zinc-900 dark:text-white mb-2">
                {t.modes.read}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Live streaming captions with scalable fonts, high contrast (WCAG AAA), and real-time teacher corrections.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 nothing-label text-[10px] text-zinc-400">
              DYSLEXIA TYPOGRAPHY
            </div>
          </div>

          {/* Pathway 2: LISTEN */}
          <div className="nothing-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <span className="nothing-label text-[10px] text-zinc-400">( 02 )</span>
              </div>
              <div className="nothing-label text-xs text-red-500 font-bold mb-1">
                MODE // LISTEN
              </div>
              <h3 className="text-lg font-bold font-heading text-zinc-900 dark:text-white mb-2">
                {t.modes.listen}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Text-to-speech audio narration with spoken verbal descriptions for diagrams for visually impaired learners.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 nothing-label text-[10px] text-zinc-400">
              AUDIO DESCRIPTIONS
            </div>
          </div>

          {/* Pathway 3: RESPOND */}
          <div className="nothing-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="nothing-label text-[10px] text-zinc-400">( 03 )</span>
              </div>
              <div className="nothing-label text-xs text-red-500 font-bold mb-1">
                MODE // RESPOND
              </div>
              <h3 className="text-lg font-bold font-heading text-zinc-900 dark:text-white mb-2">
                {t.modes.respond}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Augmentative & Alternative Communication (AAC) cards enabling non-verbal participation with live teacher feedback.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 nothing-label text-[10px] text-zinc-400">
              AAC TOUCH CARDS
            </div>
          </div>

          {/* Pathway 4: FOLLOW */}
          <div className="nothing-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <span className="nothing-label text-[10px] text-zinc-400">( 04 )</span>
              </div>
              <div className="nothing-label text-xs text-red-500 font-bold mb-1">
                MODE // FOLLOW
              </div>
              <h3 className="text-lg font-bold font-heading text-zinc-900 dark:text-white mb-2">
                {t.modes.follow}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-slate-400 leading-relaxed">
                Step-by-step sequential concept cards with simplified language toggle and key science terminology highlights.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 nothing-label text-[10px] text-zinc-400">
              STEP-BY-STEP CARDS
            </div>
          </div>
        </div>
      </section>

      {/* Realistic Classroom Scenario Spotlight */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-zinc-950 text-white p-8 sm:p-12 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="nothing-label text-xs text-red-500 font-bold">
              [ CLASSROOM CASE SCENARIO // CLASS 6 ]
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-heading mt-2">
              Class 6 Science — The Solar System
            </h3>
            <p className="mt-2 text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
              Teacher Anita speaks: <em>&ldquo;The Earth revolves around the Sun. One complete revolution takes approximately 365 days.&rdquo;</em>
            </p>

            <div className="mt-6 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span><strong>Student A</strong> views live captions in high-contrast English/Hindi.</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span><strong>Student B</strong> listens to spoken audio description of the planetary orbit diagram.</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span><strong>Student C</strong> taps AAC card: <em>&ldquo;Why do we have day and night?&rdquo;</em> (Teacher acknowledges).</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleLaunchTeacherDemo}
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-bold transition-all shadow-sm"
              >
                EXPERIENCE LIVE DEMO →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Engineering Principles */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="nothing-card p-6 space-y-2">
            <div className="nothing-label text-[10px] text-red-500 font-bold">( 01 ) PRIVACY</div>
            <h4 className="font-bold font-heading text-base text-zinc-900 dark:text-white">
              Zero Child Profiling
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Anonymous 6-character room codes. No disability disclosure, biometric cameras, or invasive behavioral tracking.
            </p>
          </div>

          <div className="nothing-card p-6 space-y-2">
            <div className="nothing-label text-[10px] text-red-500 font-bold">( 02 ) EFFICIENCY</div>
            <h4 className="font-bold font-heading text-base text-zinc-900 dark:text-white">
              Low-Bandwidth Operation
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Works on standard school laptops and midrange student smartphones with local network streaming support.
            </p>
          </div>

          <div className="nothing-card p-6 space-y-2">
            <div className="nothing-label text-[10px] text-red-500 font-bold">( 03 ) CONTROL</div>
            <h4 className="font-bold font-heading text-base text-zinc-900 dark:text-white">
              Teacher-in-the-Loop
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Teachers retain full pedagogical authority over captions, instant live corrections, diagrams, and urgent notices.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
