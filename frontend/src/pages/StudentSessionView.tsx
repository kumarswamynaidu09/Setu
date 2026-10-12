import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { StatusIndicator } from '../components/StatusIndicator';
import { BridgeMotif } from '../components/BridgeMotif';
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
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
  Check
} from 'lucide-react';

interface StudentSessionViewProps {
  navigate: (route: string, data?: any) => void;
  sessionData?: any;
}

export const StudentSessionView: React.FC<StudentSessionViewProps> = ({ sessionData, navigate }) => {
  const { t, speechRate, fontSize } = useAccessibility();
  const {
    sessionId,
    roomCode,
    connectionStatus,
    captions,
    announcements,
    questions,
    currentSectionIndex: teacherSectionIndex,
    submitQuestion,
    joinRoom
  } = useLiveClassroom();

  const { speak, pause, resume, cancel, isSpeaking, isPaused } = useSpeechSynthesis();

  const [activeMode, setActiveMode] = useState<StudentMode>('read');
  const [followTeacher, setFollowTeacher] = useState(true);
  const [studentSectionIndex, setStudentSectionIndex] = useState(0);
  const [autoScrollCaptions, setAutoScrollCaptions] = useState(true);
  const [showSimplified, setShowSimplified] = useState(false);

  // AAC / Question input state
  const [customQuestion, setCustomQuestion] = useState('');
  const [questionSentNotification, setQuestionSentNotification] = useState<string | null>(null);

  // Lesson data
  const lesson: Lesson | null = sessionData?.lesson || null;
  const captionsContainerRef = useRef<HTMLDivElement>(null);

  // Restore room connection if refreshing directly on session screen
  useEffect(() => {
    if (!sessionId && sessionData?.session_id) {
      joinRoom(sessionData.session_id, sessionData.room_code, 'student', sessionData.student_nickname || 'Student');
    }
  }, [joinRoom, sessionId, sessionData]);

  // Sync section with teacher if "Follow Teacher" is on
  useEffect(() => {
    if (followTeacher) {
      setStudentSectionIndex(teacherSectionIndex);
    }
  }, [followTeacher, teacherSectionIndex]);

  // Auto-scroll captions
  useEffect(() => {
    if (autoScrollCaptions && captionsContainerRef.current) {
      captionsContainerRef.current.scrollTop = captionsContainerRef.current.scrollHeight;
    }
  }, [autoScrollCaptions, captions]);

  const activeSection: LessonSection | undefined = lesson?.sections?.[studentSectionIndex];

  // AAC Phrase board items
  const aacPhrases = [
    { id: 'repeat', text: 'Please repeat that', icon: '🔁' },
    { id: 'needTime', text: 'I need a moment to write', icon: '⏳' },
    { id: 'understood', text: 'I understand this concept', icon: '✅' },
    { id: 'confused', text: 'Could you explain that again?', icon: '❓' },
    { id: 'answer', text: 'May I answer the question?', icon: '🙋' },
    { id: 'diagram', text: 'Please show the diagram again', icon: '🖼️' },
    { id: 'louder', text: 'Could you please speak a little louder?', icon: '🔊' },
    { id: 'help', text: 'I need teacher assistance', icon: '🆘' }
  ];

  const handleSendAAC = async (content: string) => {
    cancel();
    speak(content);
    await submitQuestion(content, 'aac_phrase');
    setQuestionSentNotification(`Sent to teacher: "${content}"`);
    setTimeout(() => setQuestionSentNotification(null), 5000);
  };

  const handleSendCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    await submitQuestion(customQuestion.trim(), 'custom_text');
    setQuestionSentNotification(`Question sent to teacher.`);
    setCustomQuestion('');
    setTimeout(() => setQuestionSentNotification(null), 5000);
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

  const modes = [
    { id: 'read', label: '1. Read (Captions)', icon: BookOpen },
    { id: 'listen', label: '2. Listen (Audio)', icon: Volume2 },
    { id: 'respond', label: '3. Communicate (AAC)', icon: MessageSquare },
    { id: 'follow', label: '4. Follow Steps', icon: ListOrdered }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Session Header Card (Civic Calm) */}
      <div className="civic-card p-5 bg-white dark:bg-[#142738] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] dark:bg-[#0A625D]/30 flex items-center justify-center text-[#0A625D] dark:text-[#E8F5F2] border border-[#BFE5DC]">
            <BridgeMotif size="md" variant="teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#19324A] dark:text-white">
                {sessionData?.class_name || 'Class 6 Science'}
              </h1>
              <span className="badge-navy text-xs">
                Room: {roomCode || 'SETU'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-[#526575] dark:text-[#9BB0C1]">
              <StatusIndicator status={connectionStatus} />
              <span>•</span>
              <span>{lesson?.title || 'Interactive Lesson'}</span>
            </div>
          </div>
        </div>

        {/* Teacher Follow Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFollowTeacher(!followTeacher)}
            aria-pressed={followTeacher}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              followTeacher
                ? 'bg-[#E8F5F2] text-[#0A625D] border-[#BFE5DC] dark:bg-[#0A625D]/30 dark:text-teal-200'
                : 'bg-white text-[#526575] border-[#D8E2DC] hover:bg-[#F7F9F8]'
            }`}
          >
            {followTeacher ? '✓ Follow Teacher Steps' : 'Self-Paced Navigation'}
          </button>
        </div>
      </div>

      {/* Announcements Banner if any */}
      {announcements.length > 0 && (
        <AnnouncementBanner announcement={announcements[0]} />
      )}

      {/* 4 Mode Switcher Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as StudentMode)}
              aria-selected={isActive}
              role="tab"
              className={`p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
                isActive
                  ? 'bg-[#0A625D] text-white border-[#084E4A] shadow-sm'
                  : 'bg-white dark:bg-[#142738] text-[#19324A] dark:text-[#F0F6F5] border-[#D8E2DC] dark:border-[#25435E] hover:bg-[#E8F5F2] dark:hover:bg-[#19324A]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification Toast */}
      {questionSentNotification && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[#E8F5F2] border border-[#BFE5DC] text-[#0A625D] text-sm font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{questionSentNotification}</span>
        </div>
      )}

      {/* Active Mode Display Container */}
      <div className="civic-card p-6 md:p-8 bg-white dark:bg-[#142738] shadow-sm">
        
        {/* ================= MODE 1: READ (CAPTIONS) ================= */}
        {activeMode === 'read' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#0A625D] animate-pulse" />
                <h2 className="text-base font-bold text-[#19324A] dark:text-white">
                  Live Classroom Captions ({captions.length})
                </h2>
              </div>
              <button
                onClick={() => setAutoScrollCaptions(!autoScrollCaptions)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                  autoScrollCaptions
                    ? 'bg-[#E8F5F2] text-[#0A625D] border-[#BFE5DC]'
                    : 'bg-[#F7F9F8] text-[#526575] border-[#D8E2DC]'
                }`}
              >
                Auto-scroll: {autoScrollCaptions ? 'ON' : 'OFF'}
              </button>
            </div>

            {captions.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E8F5F2] text-[#0A625D] flex items-center justify-center mx-auto">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-[#19324A] dark:text-white text-base">
                  Listening for Teacher Speech
                </h3>
                <p className="text-xs text-[#526575] dark:text-[#9BB0C1] max-w-sm mx-auto">
                  Live speech transcriptions will stream here in real time. Teacher corrections are applied automatically.
                </p>
              </div>
            ) : (
              <div
                ref={captionsContainerRef}
                className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
                aria-live="polite"
              >
                {captions.map((cap) => (
                  <div
                    key={cap.id}
                    className={`p-4 rounded-xl border transition-all ${
                      cap.is_corrected
                        ? 'bg-[#FEF7EE] dark:bg-[#19324A] border-[#F6D8A8]'
                        : 'bg-[#F7F9F8] dark:bg-[#0E1B26] border-[#D8E2DC] dark:border-[#25435E]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#526575] mb-1">
                      <span>Segment {cap.segment_index}</span>
                      {cap.is_corrected && (
                        <span className="badge-saffron text-[10px]">
                          ✓ Teacher Verified
                        </span>
                      )}
                    </div>
                    <p className="text-base sm:text-lg leading-relaxed text-[#19324A] dark:text-white select-text">
                      {cap.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 2: LISTEN (TTS & DIAGRAM DESCRIPTIONS) ================= */}
        {activeMode === 'listen' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#0A625D]" />
                <h2 className="text-base font-bold text-[#19324A] dark:text-white">
                  Audio Playback & Visual Descriptions
                </h2>
              </div>
              <span className="badge-mint text-xs">
                Speed: {speechRate}x
              </span>
            </div>

            {activeSection ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#E8F5F2] dark:bg-[#0A625D]/20 border border-[#BFE5DC] dark:border-[#0A625D] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0A625D] dark:text-teal-300">
                        Section {studentSectionIndex + 1} of {lesson?.sections?.length || 1}
                      </div>
                      <h3 className="text-lg font-bold text-[#19324A] dark:text-white mt-0.5">
                        {activeSection.title}
                      </h3>
                    </div>

                    <button
                      onClick={handleTTSPlaySection}
                      className="btn-civic-primary py-2.5 px-5 rounded-xl shadow-xs"
                    >
                      {isSpeaking && !isPaused ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>{isPaused ? 'Resume Audio' : 'Listen to Section'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm leading-relaxed text-[#142332] dark:text-[#E8F5F2]">
                    {showSimplified
                      ? activeSection.simplified_text || activeSection.content_text
                      : activeSection.content_text}
                  </p>
                </div>

                {/* Pedagogical Image Audio Description */}
                {activeSection.image_url && (
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E] space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#B07822]" />
                        <h4 className="font-bold text-[#19324A] dark:text-white text-sm">
                          Tactile & Pedagogical Image Description
                        </h4>
                      </div>
                      {activeSection.image_pedagogical_description && (
                        <button
                          onClick={handleTTSPlayDiagramDescription}
                          className="btn-civic-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#0A625D]" />
                          <span>Read Description</span>
                        </button>
                      )}
                    </div>

                    <img
                      src={activeSection.image_url}
                      alt={activeSection.image_alt || 'Diagram illustrating classroom lesson'}
                      className="w-full max-h-72 object-contain rounded-xl bg-slate-50 border border-slate-200"
                    />

                    {activeSection.image_pedagogical_description && (
                      <p className="text-xs text-[#526575] dark:text-[#9BB0C1] leading-relaxed bg-[#F7F9F8] dark:bg-[#142738] p-3 rounded-xl border border-[#D8E2DC] dark:border-[#25435E]">
                        <strong>Spoken description:</strong> {activeSection.image_pedagogical_description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-[#526575]">
                No lesson sections currently loaded.
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 3: RESPOND (AAC PHRASE BOARD) ================= */}
        {activeMode === 'respond' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0A625D]" />
                <h2 className="text-base font-bold text-[#19324A] dark:text-white">
                  Assistive Communication (AAC) & Inquiries
                </h2>
              </div>
              <span className="badge-saffron text-xs">
                Tap to speak & notify teacher
              </span>
            </div>

            {/* Quick Tap Phrase Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {aacPhrases.map((phrase) => (
                <button
                  key={phrase.id}
                  onClick={() => handleSendAAC(phrase.text)}
                  className="p-4 rounded-xl border border-[#D8E2DC] dark:border-[#25435E] bg-[#F7F9F8] dark:bg-[#0E1B26] hover:bg-[#E8F5F2] hover:border-[#0A625D] text-left transition-all group flex flex-col justify-between min-h-[90px]"
                >
                  <span className="text-2xl mb-1">{phrase.icon}</span>
                  <span className="text-xs sm:text-sm font-bold text-[#19324A] dark:text-white group-hover:text-[#0A625D]">
                    {phrase.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Question or Message Form */}
            <form onSubmit={handleSendCustomQuestion} className="pt-4 border-t border-[#E6ECE8] dark:border-[#1F364C] space-y-3">
              <label
                htmlFor="student-question-input"
                className="block text-sm font-bold text-[#19324A] dark:text-white"
              >
                Send Private Question or Note to Teacher
              </label>
              <div className="flex gap-2">
                <input
                  id="student-question-input"
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Type a question or clarification request..."
                  className="flex-1 p-3 rounded-xl border border-[#D8E2DC] dark:border-[#25435E] bg-white dark:bg-[#0E1B26] text-sm text-[#19324A] dark:text-white focus:outline-none focus:border-[#0A625D]"
                />
                <button
                  type="submit"
                  className="btn-civic-primary py-2.5 px-5 rounded-xl shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= MODE 4: FOLLOW (STEP CARDS) ================= */}
        {activeMode === 'follow' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-[#0A625D]" />
                <h2 className="text-base font-bold text-[#19324A] dark:text-white">
                  Step-by-Step Lesson Progress
                </h2>
              </div>
              <div className="text-xs font-semibold text-[#526575]">
                Step {studentSectionIndex + 1} of {lesson?.sections?.length || 1}
              </div>
            </div>

            <div className="space-y-4">
              {lesson?.sections?.map((sec, idx) => {
                const isCurrent = idx === studentSectionIndex;
                const isCompleted = idx < studentSectionIndex;
                return (
                  <div
                    key={sec.id || idx}
                    onClick={() => {
                      setFollowTeacher(false);
                      setStudentSectionIndex(idx);
                    }}
                    role="button"
                    tabIndex={0}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#E8F5F2] dark:bg-[#0A625D]/20 border-[#0A625D] shadow-xs'
                        : isCompleted
                        ? 'bg-[#F7F9F8] dark:bg-[#0E1B26] border-[#D8E2DC] opacity-80'
                        : 'bg-white dark:bg-[#142738] border-[#D8E2DC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-[#0A625D] text-white'
                            : isCompleted
                            ? 'bg-[#BFE5DC] text-[#0A625D]'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-[#19324A] dark:text-white">
                            {sec.title}
                          </h4>
                          {isCurrent && (
                            <p className="text-xs text-[#526575] dark:text-[#9BB0C1] mt-1 leading-relaxed">
                              {sec.content_text.slice(0, 160)}...
                            </p>
                          )}
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="badge-mint text-[11px] shrink-0">
                          Active Step
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
