import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { BridgeMotif } from '../components/BridgeMotif';
import { PrimaryActionCard } from '../components/PrimaryActionCard';
import {
  Radio,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  ArrowRight,
  Sparkles
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
    <div className="space-y-16 py-8">
      
      {/* Hero Section — Civic Public Service Identity */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F5F2] border border-[#BFE5DC] text-[#0A625D] text-xs font-bold shadow-2xs">
          <BridgeMotif size="sm" variant="teal" />
          <span>SevaFirst Innovation Challenge 2026 • Theme 03: Swasth & Samavesh Bharat</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#19324A] dark:text-white tracking-tight leading-[1.15]">
          Learning without barriers.
        </h1>

        <p className="text-base sm:text-xl text-[#526575] dark:text-[#9BB0C1] max-w-2xl mx-auto leading-relaxed">
          One classroom. Many ways to learn. SETU enables teachers to teach once while students access the lesson through <strong className="text-[#19324A] dark:text-white">Captions</strong>, <strong className="text-[#19324A] dark:text-white">Audio narration</strong>, <strong className="text-[#19324A] dark:text-white">Assisted speech</strong>, or <strong className="text-[#19324A] dark:text-white">Step-by-step guides</strong>.
        </p>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('student-join')}
            className="w-full sm:w-auto btn-civic-primary text-base py-3 px-8 rounded-xl shadow-sm hover:shadow-md"
          >
            <Radio className="w-5 h-5 text-teal-200" />
            <span>Join a Live Class</span>
          </button>

          <button
            onClick={handleLaunchTeacherDemo}
            className="w-full sm:w-auto btn-civic-secondary text-base py-3 px-7 rounded-xl"
          >
            <span>Launch Teacher Studio</span>
            <ArrowRight className="w-4 h-4 text-[#0A625D]" />
          </button>
        </div>

        <div className="text-xs text-[#526575] dark:text-[#9BB0C1] flex items-center justify-center gap-4 pt-2 flex-wrap">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0A625D]" />
            WCAG 2.2 Level AA
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0A625D]" />
            Zero child personal data collection
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0A625D]" />
            Runs on teacher laptop & student phones
          </span>
        </div>
      </section>

      {/* Student Primary Actions: 3 Obvious Choices */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="badge-navy text-xs mb-2">Student Experience</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19324A] dark:text-white">
            Three Simple Ways to Engage
          </h2>
          <p className="text-sm text-[#526575] dark:text-[#9BB0C1] mt-1 max-w-lg mx-auto">
            Choose what you want to do today. No account or password required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PrimaryActionCard
            title="1. Join a Live Class"
            description="Enter your classroom code or scan the teacher's screen to see live captions, listen to audio, and follow the lesson steps."
            icon={<Radio className="w-6 h-6" />}
            actionText="Enter Classroom Code"
            onClick={() => navigate('student-join')}
            accentVariant="teal"
            badge="LIVE SESSION"
          />

          <PrimaryActionCard
            title="2. Learn Lessons"
            description="Explore approved textbooks and science modules with audio descriptions of diagrams, text scaling, and simplified summaries."
            icon={<BookOpen className="w-6 h-6" />}
            actionText="Browse Lesson Library"
            onClick={() => navigate('student-join')}
            accentVariant="navy"
          />

          <PrimaryActionCard
            title="3. Communicate & Ask"
            description="Participate in class discussions using tap-to-speak non-verbal phrase boards, assisted speech, or private teacher questions."
            icon={<MessageSquare className="w-6 h-6" />}
            actionText="Open Communication Board"
            onClick={() => navigate('student-join')}
            accentVariant="saffron"
          />
        </div>
      </section>

      {/* Multimodal Accessibility Layer Explanation */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="civic-card p-8 md:p-10 bg-white dark:bg-[#142738] border-[#D8E2DC] dark:border-[#25435E] shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="badge-mint text-xs">Architectural Principle</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#19324A] dark:text-white">
                One Teacher Workflow. Four Simultaneous Pathways.
              </h3>
              <p className="text-sm sm:text-base text-[#526575] dark:text-[#9BB0C1] leading-relaxed">
                Teachers in Indian government schools should not have to manage multiple complex accessibility tools. SETU creates an inclusive layer so every student learns together in the mainstream classroom.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
              <div className="p-4 rounded-xl bg-[#F7F9F8] dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E]">
                <div className="text-xs font-bold text-[#0A625D] dark:text-teal-400 mb-1">01 • READ</div>
                <div className="font-bold text-[#19324A] dark:text-white text-sm">Live Captions</div>
                <div className="text-xs text-[#526575] mt-1">High contrast & dyslexia fonts</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9F8] dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E]">
                <div className="text-xs font-bold text-[#0A625D] dark:text-teal-400 mb-1">02 • LISTEN</div>
                <div className="font-bold text-[#19324A] dark:text-white text-sm">Audio Descriptions</div>
                <div className="text-xs text-[#526575] mt-1">Text-to-speech with diagram descriptions</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9F8] dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E]">
                <div className="text-xs font-bold text-[#0A625D] dark:text-teal-400 mb-1">03 • RESPOND</div>
                <div className="font-bold text-[#19324A] dark:text-white text-sm">Assisted Speech (AAC)</div>
                <div className="text-xs text-[#526575] mt-1">Tap-to-speak phrases & questions</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9F8] dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E]">
                <div className="text-xs font-bold text-[#0A625D] dark:text-teal-400 mb-1">04 • FOLLOW</div>
                <div className="font-bold text-[#19324A] dark:text-white text-sm">Step Cards</div>
                <div className="text-xs text-[#526575] mt-1">Structured checklists with teacher sync</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Service Commitment */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <BridgeMotif size="lg" variant="teal" className="mx-auto" />
        <h3 className="text-xl font-bold text-[#19324A] dark:text-white">
          Built for Indian Mainstream Government Schools
        </h3>
        <p className="text-sm text-[#526575] dark:text-[#9BB0C1] max-w-xl mx-auto leading-relaxed">
          SETU operates over local networks without requiring costly enterprise hardware or student personal smartphones. Compliant with RPwD Act 2016 and NEP 2020 inclusive education mandates.
        </p>
      </section>
    </div>
  );
};
