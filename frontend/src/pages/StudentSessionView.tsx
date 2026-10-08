import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { StudentMode, Lesson, LessonSection } from '../types';
import {
  BookOpen,
  Volume2,
  VolumeX,
  MessageSquare,
  ListOrdered,
  Radio,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  AlertCircle,
  HelpCircle,
  Play,
  Pause,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface StudentSessionViewProps {
  navigate: (route: string, data?: any) => void;
  sessionData?: any;
}

export const StudentSessionView: React.FC<StudentSessionViewProps> = ({ navigate, sessionData }) => {
  const { t, language, speechRate, fontSize, theme } = useAccessibility();
  const {
    sessionId,
    roomCode,
    connectionStatus,
    captions,
    announcements,
    questions,
    currentSectionIndex: teacherSectionIndex,
    isSessionActive,
    submitQuestion
  } = useLiveClassroom();

  const { speak, pause, resume, cancel, isSpeaking, isPaused, activeWord } = useSpeechSynthesis();

  const [activeMode, setActiveMode] = useState<StudentMode>('read');
  const [followTeacher, setFollowTeacher] = useState(true);
  const [studentSectionIndex, setStudentSectionIndex] = useState(0);
  const [autoScrollCaptions, setAutoScrollCaptions] = useState(true);
  const [showSimplified, setShowSimplified] = useState(false);

  // AAC state
  const [selectedAACPhrase, setSelectedAACPhrase] = useState<string | null>(null);
  const [customAACMessage, setCustomAACMessage] = useState('');
  const [aacSentNotification, setAacSentNotification] = useState<string | null>(null);

  // Lesson data
  const [lesson, setLesson] = useState<Lesson | null>(sessionData?.lesson || null);
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

  // AAC Phrases Preset
  const aacPhrases = [
    { id: 'pleaseRepeat', text: t.aac.pleaseRepeat, icon: '🔁' },
    { id: 'whyDayNight', text: t.aac.whyDayNight, icon: '🌍' },
    { id: 'needTime', text: t.aac.needTime, icon: '⏳' },
    { id: 'understood', text: t.aac.understood, icon: '✅' },
    { id: 'notUnderstood', text: t.aac.notUnderstood, icon: '❓' },
    { id: 'mayIAnswer', text: t.aac.mayIAnswer, icon: '🙋' },
    { id: 'showDiagram', text: t.aac.showDiagram, icon: '🖼️' },
    { id: 'needHelp', text: t.aac.needHelp, icon: '🆘' }
  ];

  const handleSendAAC = async (content: string) => {
    cancel();
    await submitQuestion(content, 'aac_phrase');
    setAacSentNotification(content);
    setSelectedAACPhrase(null);
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
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4 text-slate-900 dark:text-slate-100 min-h-screen">
      
      {/* Session Header & Status */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-3.5 h-3.5 rounded-full ${
            connectionStatus === 'connected'
              ? 'bg-teal-500 animate-pulse'
              : connectionStatus === 'reconnecting'
              ? 'bg-amber-500 animate-bounce'
              : 'bg-red-500'
          }`} />
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {sessionData?.class_name || 'Class 6 General Science'}
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              Room: <span className="font-mono text-teal-700 dark:text-teal-400">{roomCode || 'SETU89'}</span>
            </div>
          </div>
        </div>

        {/* Sync Mode Pill */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFollowTeacher(!followTeacher)}
            aria-pressed={followTeacher}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              followTeacher
                ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
                : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${followTeacher ? 'text-blue-600 animate-pulse' : ''}`} />
            <span>{followTeacher ? t.student.syncWithTeacher : t.student.selfPaced}</span>
          </button>
        </div>
      </div>

      {/* Announcements Alert Banner */}
      {announcements.length > 0 && (
        <AnnouncementBanner announcement={announcements[0]} />
      )}

      {/* 4 Accessible Interaction Modes Selector Tabs */}
      <div
        role="tablist"
        aria-label="Classroom accessibility mode"
        className="grid grid-cols-4 gap-2 bg-slate-200/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-800"
      >
        {[
          { id: 'read', label: t.modes.read, icon: BookOpen },
          { id: 'listen', label: t.modes.listen, icon: Volume2 },
          { id: 'respond', label: t.modes.respond, icon: MessageSquare },
          { id: 'follow', label: t.modes.follow, icon: ListOrdered }
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
              className={`py-3 px-2 rounded-xl text-xs font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all focus-visible:ring-2 ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-blue-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Display */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        
        {/* ================= MODE 1: READ ================= */}
        {activeMode === 'read' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-base">Live Accessible Captions</h2>
              </div>
              <button
                onClick={() => setAutoScrollCaptions(!autoScrollCaptions)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                  autoScrollCaptions
                    ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-900'
                }`}
              >
                Auto-scroll: {autoScrollCaptions ? 'ON' : 'OFF'}
              </button>
            </div>

            {captions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Radio className="w-8 h-8 mx-auto text-slate-300 animate-pulse" />
                <p className="text-sm font-medium">Waiting for teacher speech...</p>
                <p className="text-xs text-slate-400">Captions will appear here with live updates.</p>
              </div>
            ) : (
              <div
                ref={captionsContainerRef}
                className="space-y-4 max-h-[500px] overflow-y-auto pr-2 text-slate-900 dark:text-slate-100 font-medium leading-relaxed"
                aria-live="polite"
              >
                {captions.map((cap, idx) => (
                  <div
                    key={cap.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      cap.is_corrected
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <p className="text-base sm:text-lg leading-relaxed select-text">
                      {cap.text}
                    </p>
                    {cap.is_corrected && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        ✓ Teacher corrected
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                  Listening to Section {studentSectionIndex + 1}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeSection.title}
                </h2>
              </div>

              {/* Spoken Speed Indicator */}
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                Speed: {speechRate}x
              </span>
            </div>

            {/* Audio Playback Controls Card */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg">Lesson Audio Narration</h3>
                  <p className="text-xs text-teal-200">
                    {isSpeaking ? (isPaused ? 'Audio Paused' : 'Playing Section Narration...') : 'Press Play to Listen'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTTSPlaySection}
                    className="p-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black shadow-lg transition-transform active:scale-95"
                    aria-label={isSpeaking ? (isPaused ? "Resume Audio" : "Pause Audio") : "Play Lesson Section Audio"}
                  >
                    {isSpeaking && !isPaused ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  {isSpeaking && (
                    <button
                      onClick={cancel}
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white"
                      title="Stop"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section Text Display with active read styling */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-base sm:text-lg leading-relaxed font-medium">
              {activeSection.content_text}
            </div>

            {/* Educational Diagram & Spoken Description */}
            {activeSection.image_url && (
              <div className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Educational Diagram</span>
                  </div>
                  {activeSection.image_pedagogical_description && (
                    <button
                      onClick={handleTTSPlayDiagramDescription}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.student.audioDescription}</span>
                    </button>
                  )}
                </div>

                <img
                  src={activeSection.image_url}
                  alt={activeSection.image_alt || activeSection.title}
                  className="w-full max-h-64 object-cover rounded-2xl shadow-xs"
                />

                {activeSection.image_pedagogical_description && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 leading-relaxed">
                    <strong>Spoken Audio Description:</strong> {activeSection.image_pedagogical_description}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 3: RESPOND (AAC) ================= */}
        {activeMode === 'respond' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>{t.student.aacTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tap any card to preview and send a question or response directly to your teacher.
              </p>
            </div>

            {/* Success notification banner when sent */}
            {aacSentNotification && (
              <div
                role="status"
                className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 text-teal-950 dark:text-teal-200 text-sm font-bold flex items-center gap-3 animate-in fade-in"
              >
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <div>Message Sent: &ldquo;{aacSentNotification}&rdquo;</div>
                  <div className="text-xs font-medium text-teal-800 dark:text-teal-300 mt-0.5">
                    Your teacher has received this in their classroom inbox.
                  </div>
                </div>
              </div>
            )}

            {/* AAC Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aacPhrases.map((phrase) => (
                <button
                  key={phrase.id}
                  onClick={() => handleSendAAC(phrase.text)}
                  className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-left transition-all flex items-center justify-between gap-3 group active:scale-98 focus-visible:ring-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{phrase.icon}</span>
                    <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-teal-200">
                      {phrase.text}
                    </span>
                  </div>
                  <Send className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
                </button>
              ))}
            </div>

            {/* Custom Text Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <label htmlFor="custom-aac-input" className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                {t.student.customMessagePrompt}
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-aac-input"
                  type="text"
                  value={customAACMessage}
                  onChange={(e) => setCustomAACMessage(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={() => {
                    if (customAACMessage.trim()) {
                      handleSendAAC(customAACMessage.trim());
                    }
                  }}
                  disabled={!customAACMessage.trim()}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm shadow-xs transition-colors"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Feedback from teacher on previous queries */}
            {questions.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Teacher Response Feed
                </h3>
                <div className="space-y-2">
                  {questions.slice(0, 3).map(q => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border text-xs ${
                        q.status === 'acknowledged'
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 text-blue-900 dark:text-blue-200'
                          : q.status === 'answered'
                          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 text-green-900 dark:text-green-200'
                          : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">&ldquo;{q.content}&rdquo;</div>
                      {q.status === 'acknowledged' && (
                        <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 mt-1">
                          ✓ Teacher saw this and acknowledged.
                        </div>
                      )}
                      {q.status === 'answered' && q.response_text && (
                        <div className="text-[11px] font-semibold text-green-800 dark:text-green-300 mt-1">
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                  Step {studentSectionIndex + 1} of {lesson?.sections?.length || 1}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeSection.title}
                </h2>
              </div>

              {/* Simplified Language Toggle */}
              <button
                onClick={() => setShowSimplified(!showSimplified)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  showSimplified
                    ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200'
                    : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-900'
                }`}
              >
                {t.student.simplifiedText}: {showSimplified ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Main Content Box */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <p className="text-base sm:text-xl leading-relaxed font-medium">
                {showSimplified ? (activeSection.simplified_text || activeSection.content_text) : activeSection.content_text}
              </p>

              {/* Key Terms Highlight */}
              {activeSection.key_terms && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase text-slate-500">{t.student.keyTerms}:</span>
                  {activeSection.key_terms.split(',').map((term, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-purple-800 dark:text-purple-300"
                    >
                      {term.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setFollowTeacher(false);
                  setStudentSectionIndex(Math.max(0, studentSectionIndex - 1));
                }}
                disabled={studentSectionIndex === 0}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 disabled:opacity-40 text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.student.prevSection}</span>
              </button>

              <button
                onClick={() => {
                  setFollowTeacher(false);
                  if (lesson?.sections) {
                    setStudentSectionIndex(Math.min(lesson.sections.length - 1, studentSectionIndex + 1));
                  }
                }}
                disabled={!lesson?.sections || studentSectionIndex >= lesson.sections.length - 1}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>{t.student.nextSection}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
