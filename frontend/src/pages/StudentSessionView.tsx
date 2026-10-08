import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import type { StudentMode, Lesson, LessonSection } from '../types';
import {
  BookOpen,
  Volume2,
  MessageSquare,
  ListOrdered,
  Radio,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Send,
  Play,
  Pause,
  Image as ImageIcon
} from 'lucide-react';

interface StudentSessionViewProps {
  navigate: (route: string, data?: any) => void;
  sessionData?: any;
}

export const StudentSessionView: React.FC<StudentSessionViewProps> = ({ sessionData }) => {
  const { t, speechRate } = useAccessibility();
  const {
    roomCode,
    connectionStatus,
    captions,
    announcements,
    questions,
    currentSectionIndex: teacherSectionIndex,
    submitQuestion
  } = useLiveClassroom();

  const { speak, pause, resume, cancel, isSpeaking, isPaused } = useSpeechSynthesis();

  const [activeMode, setActiveMode] = useState<StudentMode>('read');
  const [followTeacher, setFollowTeacher] = useState(true);
  const [studentSectionIndex, setStudentSectionIndex] = useState(0);
  const [autoScrollCaptions, setAutoScrollCaptions] = useState(true);
  const [showSimplified, setShowSimplified] = useState(false);

  // AAC state
  const [customAACMessage, setCustomAACMessage] = useState('');
  const [aacSentNotification, setAacSentNotification] = useState<string | null>(null);

  // Lesson data
  const lesson: Lesson | null = sessionData?.lesson || null;
  const captionsContainerRef = useRef<HTMLDivElement>(null);

  // Sync section with teacher if "Follow Teacher" is on
  useEffect(() => {
    if (followTeacher) {
      setStudentSectionIndex(teacherSectionIndex);
    }
  }, [followTeacher, teacherSectionIndex]);

  // Auto-scroll to bottom of captions
  useEffect(() => {
    if (autoScrollCaptions && captionsContainerRef.current) {
      captionsContainerRef.current.scrollTop = captionsContainerRef.current.scrollHeight;
    }
  }, [autoScrollCaptions, captions]);

  const activeSection: LessonSection | undefined = lesson?.sections?.[studentSectionIndex];

  // AAC Phrases Preset (Nothing Style)
  const aacPhrases = [
    { id: 'pleaseRepeat', text: t.aac.pleaseRepeat, code: '01', icon: '🔁' },
    { id: 'whyDayNight', text: t.aac.whyDayNight, code: '02', icon: '🌍' },
    { id: 'needTime', text: t.aac.needTime, code: '03', icon: '⏳' },
    { id: 'understood', text: t.aac.understood, code: '04', icon: '✅' },
    { id: 'notUnderstood', text: t.aac.notUnderstood, code: '05', icon: '❓' },
    { id: 'mayIAnswer', text: t.aac.mayIAnswer, code: '06', icon: '🙋' },
    { id: 'showDiagram', text: t.aac.showDiagram, code: '07', icon: '🖼️' },
    { id: 'needHelp', text: t.aac.needHelp, code: '08', icon: '🆘' }
  ];

  const handleSendAAC = async (content: string) => {
    cancel();
    await submitQuestion(content, 'aac_phrase');
    setAacSentNotification(content);
    setCustomAACMessage('');
    setTimeout(() => {
      setAacSentNotification(null);
    }, 6000);
  };

  const handleTTSPlaySection = () => {
    if (!activeSection) return;
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      const textToRead = showSimplified
        ? `${activeSection.title}. ${activeSection.simplified_text || activeSection.content_text}`
        : `${activeSection.title}. ${activeSection.content_text}`;
      speak(textToRead);
    }
  };

  const handleTTSPlayDiagramDescription = () => {
    if (!activeSection?.image_pedagogical_description) return;
    speak(`Audio description for diagram: ${activeSection.image_pedagogical_description}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4 text-zinc-900 dark:text-zinc-100 min-h-screen">
      
      {/* Session Header & Status in Nothing Industrial Design */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${
            connectionStatus === 'connected'
              ? 'bg-red-500 animate-pulse'
              : connectionStatus === 'reconnecting'
              ? 'bg-amber-500 animate-bounce'
              : 'bg-zinc-400'
          }`} />
          <div>
            <div className="nothing-label text-[9px] text-zinc-400">
              {sessionData?.class_name || 'CLASS 6 SCIENCE'}
            </div>
            <div className="text-xs font-bold">
              ROOM // <span className="text-red-500">{roomCode || 'SETU89'}</span>
            </div>
          </div>
        </div>

        {/* Sync Mode Pill */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFollowTeacher(!followTeacher)}
            aria-pressed={followTeacher}
            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
              followTeacher
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                : 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Radio className={`w-3 h-3 ${followTeacher ? 'text-red-500 animate-pulse' : ''}`} />
            <span>{followTeacher ? 'SYNCED TO TEACHER' : 'SELF-PACED'}</span>
          </button>
        </div>
      </div>

      {/* Announcements Alert Banner */}
      {announcements.length > 0 && (
        <AnnouncementBanner announcement={announcements[0]} />
      )}

      {/* 4 Accessible Interaction Modes Selector (Nothing Segmented Switch) */}
      <div
        role="tablist"
        aria-label="Classroom accessibility mode"
        className="grid grid-cols-4 gap-1.5 bg-zinc-100 dark:bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-mono"
      >
        {[
          { id: 'read', label: 'READ', sub: '01', icon: BookOpen },
          { id: 'listen', label: 'LISTEN', sub: '02', icon: Volume2 },
          { id: 'respond', label: 'RESPOND', sub: '03', icon: MessageSquare },
          { id: 'follow', label: 'FOLLOW', sub: '04', icon: ListOrdered }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                cancel();
                setActiveMode(tab.id as StudentMode);
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all focus-visible:ring-2 ${
                isActive
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs border border-zinc-900 dark:border-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span className={`text-[10px] opacity-70 ${isActive ? 'text-red-400 dark:text-red-600' : ''}`}>({tab.sub})</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Display */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-6">
        
        {/* ================= MODE 1: READ ================= */}
        {activeMode === 'read' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 font-mono">
              <div className="flex items-center gap-2">
                <span className="glyph-dot glyph-dot-pulse" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white">
                  LIVE STREAMING CAPTIONS ({captions.length})
                </h2>
              </div>
              <button
                onClick={() => setAutoScrollCaptions(!autoScrollCaptions)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  autoScrollCaptions
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800'
                }`}
              >
                AUTO-SCROLL: {autoScrollCaptions ? 'ON' : 'OFF'}
              </button>
            </div>

            {captions.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 space-y-2 font-mono text-xs">
                <Radio className="w-6 h-6 mx-auto text-zinc-300 animate-pulse" />
                <p>WAITING FOR TEACHER SPEECH...</p>
                <p className="text-[10px] opacity-70">Captions will render here with live corrections.</p>
              </div>
            ) : (
              <div
                ref={captionsContainerRef}
                className="space-y-3 max-h-[500px] overflow-y-auto pr-1 text-zinc-900 dark:text-zinc-100 leading-relaxed"
                aria-live="polite"
              >
                {captions.map((cap) => (
                  <div
                    key={cap.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      cap.is_corrected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-900 border-red-500'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="nothing-label text-[9px] text-zinc-400 mb-1">
                      ( SEGMENT {cap.segment_index} )
                    </div>
                    <p className="text-base sm:text-lg leading-relaxed select-text font-normal">
                      {cap.text}
                    </p>
                    {cap.is_corrected && (
                      <span className="nothing-label inline-block mt-1 text-[9px] text-red-400 font-bold">
                        ✓ TEACHER CORRECTED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 2: LISTEN ================= */}
        {activeMode === 'listen' && activeSection && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="nothing-label text-[10px] text-red-500 font-bold">
                  [ SECTION 0{studentSectionIndex + 1} // AUDIO MODE ]
                </div>
                <h2 className="text-xl font-bold font-heading text-zinc-900 dark:text-white mt-0.5">
                  {activeSection.title}
                </h2>
              </div>

              {/* Spoken Speed Indicator */}
              <span className="nothing-label text-[10px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                RATE // {speechRate}X
              </span>
            </div>

            {/* Audio Playback Controls Card (Nothing Hardware Style) */}
            <div className="bg-zinc-950 text-white p-6 rounded-3xl border border-zinc-800 shadow-md space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <div className="nothing-label text-[10px] text-red-500">
                    AUDIO CONTROLLER
                  </div>
                  <h3 className="font-bold text-base font-heading">
                    {isSpeaking ? (isPaused ? 'Narration Paused' : 'Playing Section Narration...') : 'Ready to Listen'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTTSPlaySection}
                    className="p-3.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold shadow-md transition-transform active:scale-95"
                    aria-label={isSpeaking ? (isPaused ? "Resume Audio" : "Pause Audio") : "Play Lesson Section Audio"}
                  >
                    {isSpeaking && !isPaused ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  {isSpeaking && (
                    <button
                      onClick={cancel}
                      className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                      title="Stop"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section Text Display */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-base sm:text-lg leading-relaxed font-normal">
              {activeSection.content_text}
            </div>

            {/* Educational Diagram & Spoken Description */}
            {activeSection.image_url && (
              <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="nothing-label text-[10px] text-zinc-500 flex items-center gap-1.5 font-bold">
                    <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>DIAGRAM VISUAL</span>
                  </div>
                  {activeSection.image_pedagogical_description && (
                    <button
                      onClick={handleTTSPlayDiagramDescription}
                      className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-[10px] font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Volume2 className="w-3 h-3 text-red-500" />
                      <span>LISTEN TO DIAGRAM</span>
                    </button>
                  )}
                </div>

                <img
                  src={activeSection.image_url}
                  alt={activeSection.image_alt || activeSection.title}
                  className="w-full max-h-64 object-cover rounded-2xl border border-zinc-200 dark:border-zinc-800"
                />

                {activeSection.image_pedagogical_description && (
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 leading-relaxed font-normal">
                    <span className="font-bold text-zinc-900 dark:text-white">Audio Description:</span> {activeSection.image_pedagogical_description}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 3: RESPOND (AAC) ================= */}
        {activeMode === 'respond' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800 font-mono">
              <div className="nothing-label text-[10px] text-red-500 font-bold">[ AAC TOUCH BOARD ]</div>
              <h2 className="font-bold text-base font-heading text-zinc-900 dark:text-white mt-0.5">
                {t.student.aacTitle}
              </h2>
            </div>

            {/* Success notification banner when sent */}
            {aacSentNotification && (
              <div
                role="status"
                className="p-4 rounded-2xl bg-zinc-900 text-white border border-red-500/80 text-xs font-mono font-bold flex items-center gap-3 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <div>
                  <div>SENT // &ldquo;{aacSentNotification}&rdquo;</div>
                  <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                    Your message was delivered to the teacher's inbox.
                  </div>
                </div>
              </div>
            )}

            {/* AAC Card Grid (Nothing Monochrome Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {aacPhrases.map((phrase) => (
                <button
                  key={phrase.id}
                  onClick={() => handleSendAAC(phrase.text)}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-red-500 dark:hover:border-red-500 text-left transition-all flex items-center justify-between gap-3 group active:scale-98 focus-visible:ring-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{phrase.icon}</span>
                    <div>
                      <span className="nothing-label text-[9px] text-zinc-400 block">({phrase.code})</span>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-red-500 transition-colors">
                        {phrase.text}
                      </span>
                    </div>
                  </div>
                  <Send className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-500 shrink-0" />
                </button>
              ))}
            </div>

            {/* Custom Text Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2 font-mono">
              <label htmlFor="custom-aac-input" className="nothing-label block text-xs text-zinc-500 dark:text-zinc-400">
                OR TYPE CUSTOM QUERY
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-aac-input"
                  type="text"
                  value={customAACMessage}
                  onChange={(e) => setCustomAACMessage(e.target.value)}
                  placeholder="Type message to teacher..."
                  className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                />
                <button
                  onClick={() => {
                    if (customAACMessage.trim()) {
                      handleSendAAC(customAACMessage.trim());
                    }
                  }}
                  disabled={!customAACMessage.trim()}
                  className="px-4 py-2 nothing-btn-primary text-xs font-bold disabled:opacity-40"
                >
                  SEND
                </button>
              </div>
            </div>

            {/* Teacher Feedback Feed */}
            {questions.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800 font-mono text-xs">
                <h3 className="nothing-label text-[10px] text-zinc-400 tracking-wider">
                  TEACHER STATUS FEED
                </h3>
                <div className="space-y-2">
                  {questions.slice(0, 3).map(q => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border ${
                        q.status === 'acknowledged'
                          ? 'bg-zinc-900 text-white border-red-500'
                          : q.status === 'answered'
                          ? 'bg-zinc-900 text-white border-zinc-700'
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="font-bold">&ldquo;{q.content}&rdquo;</div>
                      {q.status === 'acknowledged' && (
                        <div className="text-[10px] text-red-400 mt-1 font-bold">
                          ✓ TEACHER SAW AND ACKNOWLEDGED
                        </div>
                      )}
                      {q.status === 'answered' && q.response_text && (
                        <div className="text-[10px] text-zinc-300 mt-1">
                          Teacher answered: {q.response_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 4: FOLLOW (Step-by-Step) ================= */}
        {activeMode === 'follow' && activeSection && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 font-mono">
              <div>
                <span className="nothing-label text-[10px] text-red-500 font-bold">
                  STEP // 0{studentSectionIndex + 1} OF 0{lesson?.sections?.length || 1}
                </span>
                <h2 className="text-xl font-bold font-heading text-zinc-900 dark:text-white mt-0.5">
                  {activeSection.title}
                </h2>
              </div>

              {/* Simplified Language Toggle */}
              <button
                onClick={() => setShowSimplified(!showSimplified)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  showSimplified
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800'
                }`}
              >
                SIMPLIFIED: {showSimplified ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Main Content Box */}
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <p className="text-base sm:text-xl leading-relaxed font-normal">
                {showSimplified ? (activeSection.simplified_text || activeSection.content_text) : activeSection.content_text}
              </p>

              {/* Key Terms Highlight */}
              {activeSection.key_terms && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 flex-wrap font-mono">
                  <span className="nothing-label text-[10px] text-zinc-400">KEY TERMS:</span>
                  {activeSection.key_terms.split(',').map((term, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[11px] font-bold text-zinc-900 dark:text-white"
                    >
                      {term.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-2 font-mono">
              <button
                onClick={() => {
                  setFollowTeacher(false);
                  setStudentSectionIndex(Math.max(0, studentSectionIndex - 1));
                }}
                disabled={studentSectionIndex === 0}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>PREV STEP</span>
              </button>

              <button
                onClick={() => {
                  setFollowTeacher(false);
                  if (lesson?.sections) {
                    setStudentSectionIndex(Math.min(lesson.sections.length - 1, studentSectionIndex + 1));
                  }
                }}
                disabled={!lesson?.sections || studentSectionIndex >= lesson.sections.length - 1}
                className="px-5 py-2 nothing-btn-primary disabled:opacity-30 text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>NEXT STEP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
