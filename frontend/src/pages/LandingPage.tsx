import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import {
  Radio,
  BookOpen,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Volume2
} from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      
      {/* Hero Section */}
      <section className="text-center space-y-5 pt-4">
        <span className="badge-ios-blue text-xs font-semibold px-3 py-1">
          Swasth & Samavesh Bharat • SevaFirst 2026
        </span>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
          Learning without barriers.
        </h1>

        <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          One teacher workflow. Four simultaneous accessible pathways: <strong className="text-slate-800">Live Captions</strong>, <strong className="text-slate-800">Audio narration</strong>, <strong className="text-slate-800">Assisted speech</strong>, and <strong className="text-slate-800">Step cards</strong>.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('student-join')}
            className="btn-ios-primary w-full sm:w-auto text-base py-3 px-8"
          >
            <span>Join a Classroom</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLaunchTeacherDemo}
            className="btn-ios-secondary w-full sm:w-auto text-base py-3 px-6"
          >
            <span>Teacher Studio Demo</span>
          </button>
        </div>
      </section>

      {/* 3 Student Actions — Clean iOS Cards */}
      <section className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Three Ways to Learn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose what you need. Zero registration required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div
            onClick={() => navigate('student-join')}
            role="button"
            tabIndex={0}
            className="ios-card p-6 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                1. Join Live Class
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect using your teacher's 6-character room code to see live real-time captions and lesson steps.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-blue-600">
              <span>Enter room code</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigate('student-join')}
            role="button"
            tabIndex={0}
            className="ios-card p-6 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                2. Listen & Read
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Text-to-speech audio narration with spoken diagram descriptions and high-contrast font scaling.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-indigo-600">
              <span>Explore lessons</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigate('student-join')}
            role="button"
            tabIndex={0}
            className="ios-card p-6 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                3. Communicate
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tap-to-speak assistive communication board (AAC) and private questions sent directly to your teacher.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-amber-600">
              <span>Open phrase board</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Public Service Core Information */}
      <section className="ios-card p-8 bg-white border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-lg">
          <span className="badge-ios-green text-xs font-semibold">
            Universal Design
          </span>
          <h3 className="text-xl font-bold text-slate-900">
            One lesson taught. Four accessible pathways.
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Designed for mainstream Indian government schools under RPwD Act 2016 and NEP 2020. Operates reliably on teacher laptops and student devices.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="badge-ios-blue text-xs">WCAG 2.2 AA</span>
          <span className="badge-ios-blue text-xs">Zero Child Profiling</span>
          <span className="badge-ios-blue text-xs">Ephemeral Audio</span>
        </div>
      </section>
    </div>
  );
};
