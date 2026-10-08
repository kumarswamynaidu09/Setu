import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { QRCodeModal } from '../components/QRCodeModal';
import type { LiveSession, Lesson } from '../types';
import {
  Mic,
  MicOff,
  Radio,
  QrCode,
  Users,
  Megaphone,
  CheckCircle2,
  Edit2,
  Check,
  X,
  MessageSquare,
  BookOpen,
  LogOut
} from 'lucide-react';

interface TeacherLiveClassroomProps {
  navigate: (route: string, data?: any) => void;
  sessionData?: LiveSession;
}

export const TeacherLiveClassroom: React.FC<TeacherLiveClassroomProps> = ({ navigate, sessionData }) => {
  const { t, language } = useAccessibility();
  const {
    roomCode,
    participantCount,
    captions,
    questions,
    currentSectionIndex,
    syncSection,
    publishAnnouncement,
    acknowledgeQuestion,
    answerQuestion,
    postCaption,
    correctCaption,
    endSession
  } = useLiveClassroom();

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(sessionData?.lesson || null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState('');

  // Announcement modal state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'Assignment' | 'Exam' | 'Timetable' | 'Safety' | 'General'>('General');
  const [isPublishingAnn, setIsPublishingAnn] = useState(false);

  // Answering student question state
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  // Speech Recognition integration
  const handleSegmentCaptured = async (text: string, isFinal: boolean) => {
    if (isFinal && text.trim()) {
      await postCaption(text.trim(), language);
    }
  };

  const {
    isListening,
    interimText,
    error: micError,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onSegmentCaptured: handleSegmentCaptured,
    language
  });

  // Fetch full lesson if not present in sessionData
  useEffect(() => {
    if (sessionData?.lesson_id && !activeLesson) {
      fetch(`/api/lessons/${sessionData.lesson_id}`)
        .then(res => res.json())
        .then(data => setActiveLesson(data))
        .catch(console.error);
    }
  }, [activeLesson, sessionData]);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleStartCaptionEdit = (capId: string, currentText: string) => {
    setEditingCaptionId(capId);
    setEditingCaptionText(currentText);
  };

  const handleSaveCaptionEdit = async (capId: string) => {
    if (!editingCaptionText.trim()) return;
    await correctCaption(capId, editingCaptionText.trim());
    setEditingCaptionId(null);
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    await publishAnnouncement(annTitle.trim(), annContent.trim(), annCategory);
    setAnnTitle('');
    setAnnContent('');
    setIsPublishingAnn(false);
  };

  const handleSendAnswer = async (qId: string) => {
    if (!responseText.trim()) return;
    await answerQuestion(qId, responseText.trim());
    setAnsweringQuestionId(null);
    setResponseText('');
  };

  const handleEndClass = async () => {
    if (window.confirm(t.teacher.confirmEndSession)) {
      stopListening();
      await endSession();
      navigate('teacher-dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-zinc-900 dark:text-zinc-100 font-body">
      
      {/* Live Classroom Top Bar */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="glyph-dot glyph-dot-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-heading tracking-tight">
                Live Classroom Session
              </h1>
              <span className="nothing-label text-xs px-2.5 py-1 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold">
                ROOM // {roomCode || 'SETU'}
              </span>
            </div>
            <p className="nothing-label text-[10px] text-zinc-400 mt-0.5">
              {activeLesson?.title || 'Interactive Lesson'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto font-mono text-xs">
          {/* Connected Students Counter */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>{participantCount} CONNECTED</span>
          </div>

          {/* QR Code Projector Button */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-red-500" />
            <span>PROJECT QR</span>
          </button>

          {/* New Announcement Button */}
          <button
            onClick={() => setIsPublishingAnn(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold shadow-xs transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>ANNOUNCE</span>
          </button>

          {/* End Session Button */}
          <button
            onClick={handleEndClass}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>END SESSION</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Captions & Speech Controls, Right = Active Lesson Sections & Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Live Speech Recognition & Caption Stream */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Microphone Capture Widget (Nothing Style) */}
          <div className="bg-zinc-950 text-white p-6 rounded-3xl border border-zinc-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}>
                  {isListening ? <Mic className="w-5 h-5 text-red-500" /> : <MicOff className="w-5 h-5" />}
                </div>
                <div>
                  <div className="nothing-label text-[10px] text-zinc-400">
                    {isListening ? '[ REC // LIVE STREAMING ]' : '[ MIC // STANDBY ]'}
                  </div>
                  <h2 className="text-base font-bold font-heading">
                    {isListening ? t.teacher.micOn : t.teacher.micOff}
                  </h2>
                </div>
              </div>

              <button
                onClick={handleToggleMic}
                className={`px-5 py-2.5 rounded-xl font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-md'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-red-600" />}
                <span>{isListening ? 'STOP CAPTIONS' : 'START SPEECH'}</span>
              </button>
            </div>

            {/* Interim Speech Preview */}
            {isListening && interimText && (
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-2">
                <span className="glyph-dot glyph-dot-pulse" />
                <span className="truncate">TRANSCRIPTION // {interimText}</span>
              </div>
            )}

            {micError && (
              <div className="p-3 bg-red-950/80 rounded-xl border border-red-800 text-xs font-mono text-red-200">
                {micError}
              </div>
            )}
          </div>

          {/* Real-time Caption Stream with Edit/Correction */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold font-heading text-base flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500" />
                <span>Live Transcript ({captions.length})</span>
              </h2>
              <span className="nothing-label text-[10px] text-zinc-400">
                CLICK PENCIL TO CORRECT
              </span>
            </div>

            {captions.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 font-mono text-xs">
                WAITING FOR MICROPHONE INPUT...
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {captions.map((cap, idx) => (
                  <div
                    key={cap.id}
                    className={`p-4 rounded-2xl border transition-all text-sm ${
                      cap.is_corrected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-900 border-red-500'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {editingCaptionId === cap.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editingCaptionText}
                          onChange={(e) => setEditingCaptionText(e.target.value)}
                          className="w-full p-2.5 text-sm rounded-xl border border-red-500 bg-white dark:bg-zinc-800 focus:outline-none font-mono"
                        />
                        <div className="flex justify-end gap-2 font-mono">
                          <button
                            onClick={() => setEditingCaptionId(null)}
                            className="px-2.5 py-1 text-xs text-zinc-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            CANCEL
                          </button>
                          <button
                            onClick={() => handleSaveCaptionEdit(cap.id)}
                            className="px-3 py-1 text-xs bg-red-600 text-white font-bold rounded-lg flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>SAVE & BROADCAST</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="nothing-label text-[10px] text-zinc-400">
                            ( SEGMENT {cap.segment_index || idx + 1} )
                          </div>
                          <p className="leading-relaxed font-normal">
                            {cap.text}
                          </p>
                          {cap.is_corrected && (
                            <div className="nothing-label text-[10px] text-red-400 font-bold">
                              ✓ TEACHER CORRECTED
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleStartCaptionEdit(cap.id, cap.text)}
                          title="Correct this caption segment"
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 shrink-0"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 Cols): Lesson Sections Controller & Student AAC / Questions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Lesson Section Synchronization Control */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold font-heading text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-400" />
                <span>Lesson Progress & Sync</span>
              </h2>
              <span className="nothing-label text-xs text-red-500 font-bold">
                [ {currentSectionIndex + 1} / {activeLesson?.sections?.length || 1} ]
              </span>
            </div>

            <div className="space-y-2">
              {activeLesson?.sections?.map((sec, idx) => (
                <div
                  key={idx}
                  onClick={() => syncSection(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentSectionIndex === idx
                      ? 'bg-zinc-900 text-white dark:bg-zinc-900 border-red-500 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold font-heading line-clamp-1">
                      {sec.title}
                    </div>
                    <div className="text-[11px] opacity-70 line-clamp-1">
                      {sec.content_text}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      syncSection(idx);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 ml-2 ${
                      currentSectionIndex === idx
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {currentSectionIndex === idx ? 'LIVE' : 'SYNC'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Student Questions & AAC Inbox */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold font-heading text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <span>AAC Inbox ({questions.length})</span>
              </h2>
            </div>

            {questions.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 font-mono text-xs">
                NO AAC MESSAGES YET
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 font-mono text-xs">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      q.status === 'acknowledged'
                        ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700'
                        : q.status === 'answered'
                        ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700'
                        : 'bg-zinc-900 text-white dark:bg-zinc-900 border-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        {q.student_nickname}
                      </span>
                      <span className={`nothing-label px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        q.status === 'acknowledged'
                          ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                          : q.status === 'answered'
                          ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                          : 'bg-red-500 text-white'
                      }`}>
                        [ {q.status.toUpperCase()} ]
                      </span>
                    </div>

                    <p className="text-sm font-semibold font-body">
                      &ldquo;{q.content}&rdquo;
                    </p>

                    {q.response_text && (
                      <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 text-xs">
                        <strong>Answer:</strong> {q.response_text}
                      </div>
                    )}

                    {q.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1 font-mono">
                        <button
                          onClick={() => acknowledgeQuestion(q.id)}
                          className="px-3 py-1 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg font-bold flex items-center gap-1 text-[10px]"
                        >
                          <CheckCircle2 className="w-3 h-3 text-red-500" />
                          <span>ACKNOWLEDGE</span>
                        </button>
                        <button
                          onClick={() => setAnsweringQuestionId(q.id)}
                          className="px-3 py-1 bg-zinc-800 text-white rounded-lg font-bold text-[10px]"
                        >
                          REPLY
                        </button>
                      </div>
                    )}

                    {answeringQuestionId === q.id && (
                      <div className="mt-2 space-y-2 pt-2 border-t border-zinc-700">
                        <input
                          type="text"
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type answer to broadcast..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-xs font-mono"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setAnsweringQuestionId(null)}
                            className="px-2 py-1 text-[10px] text-zinc-400"
                          >
                            CANCEL
                          </button>
                          <button
                            onClick={() => handleSendAnswer(q.id)}
                            className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg"
                          >
                            SEND
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Publish Announcement Modal */}
      {isPublishingAnn && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ann-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h2 id="ann-modal-title" className="text-lg font-bold font-heading flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-red-500" />
                <span>Publish Announcement</span>
              </h2>
              <button
                onClick={() => setIsPublishingAnn(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="space-y-4 font-mono">
              <div>
                <label className="nothing-label block text-xs text-zinc-400 mb-1">
                  CATEGORY
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
                  {(['General', 'Exam', 'Assignment', 'Timetable', 'Safety'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAnnCategory(cat)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                        annCategory === cat
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="nothing-label block text-xs text-zinc-400 mb-1">
                  TITLE
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Unit Test on Solar System"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                />
              </div>

              <div>
                <label className="nothing-label block text-xs text-zinc-400 mb-1">
                  CONTENT
                </label>
                <textarea
                  rows={3}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="e.g. Please revise sections 1 to 4 before Monday..."
                  className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishingAnn(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 nothing-btn-primary text-xs font-bold"
                >
                  BROADCAST NOW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Projector Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        roomCode={roomCode || 'SETU89'}
        classNameTitle={activeLesson?.title || 'Class 6 General Science'}
      />
    </div>
  );
};
