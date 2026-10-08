import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { QRCodeModal } from '../components/QRCodeModal';
import { LiveSession, Lesson, LessonSection } from '../types';
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
  ArrowRight,
  LogOut,
  Send,
  AlertCircle,
  Volume2
} from 'lucide-react';

interface TeacherLiveClassroomProps {
  navigate: (route: string, data?: any) => void;
  sessionData?: LiveSession;
}

export const TeacherLiveClassroom: React.FC<TeacherLiveClassroomProps> = ({ navigate, sessionData }) => {
  const { t, language } = useAccessibility();
  const {
    sessionId,
    roomCode,
    participantCount,
    captions,
    announcements,
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
    hasMicPermission,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Live Classroom Top Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">
                Live Classroom Session
              </h1>
              <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                Code: {roomCode || 'SETU'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeLesson?.title || 'Interactive Lesson'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Connected Students Counter */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Users className="w-4 h-4 text-teal-600" />
            <span>{participantCount} Students Connected</span>
          </div>

          {/* QR Code Projector Button */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Project QR</span>
          </button>

          {/* New Announcement Button */}
          <button
            onClick={() => setIsPublishingAnn(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            <span>Announcement</span>
          </button>

          {/* End Session Button */}
          <button
            onClick={handleEndClass}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.teacher.endSession}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Captions & Speech Controls, Right = Active Lesson Sections & Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Live Speech Recognition & Caption Stream */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Microphone Capture Widget */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-3xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl ${isListening ? 'bg-red-500/20 text-red-300 animate-pulse border border-red-400' : 'bg-white/10 text-white'}`}>
                  {isListening ? <Mic className="w-6 h-6 text-red-400" /> : <MicOff className="w-6 h-6 text-slate-300" />}
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {isListening ? t.teacher.micOn : t.teacher.micOff}
                  </h2>
                  <p className="text-xs text-blue-200">
                    {isListening ? 'Streaming speech recognition chunks to student screens...' : 'Click to start microphone captioning.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleMic}
                className={`px-6 py-3 rounded-2xl font-black text-sm shadow-md transition-all flex items-center gap-2 ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? t.teacher.stopCaptions : t.teacher.startCaptions}</span>
              </button>
            </div>

            {/* Interim Speech Preview */}
            {isListening && interimText && (
              <div className="p-3 bg-white/10 rounded-xl border border-white/20 text-xs font-mono italic text-teal-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>Recognizing: {interimText}</span>
              </div>
            )}

            {micError && (
              <div className="p-3 bg-red-950/60 rounded-xl border border-red-800 text-xs text-red-200">
                {micError}
              </div>
            )}
          </div>

          {/* Real-time Caption Stream with Edit/Correction */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600" />
                <span>{t.teacher.liveCaptionsTitle} ({captions.length})</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Click pencil to correct scientific terminology
              </span>
            </div>

            {captions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No speech detected yet. Speak into the microphone to stream live captions.
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {captions.map((cap) => (
                  <div
                    key={cap.id}
                    className={`p-3.5 rounded-2xl border transition-all text-sm ${
                      cap.is_corrected
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {editingCaptionId === cap.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editingCaptionText}
                          onChange={(e) => setEditingCaptionText(e.target.value)}
                          className="w-full p-2 text-sm rounded-xl border border-blue-400 bg-white dark:bg-slate-800 focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingCaptionId(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveCaptionEdit(cap.id)}
                            className="px-3 py-1 text-xs bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.teacher.saveCorrection}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="leading-relaxed text-slate-800 dark:text-slate-100 font-medium">
                            {cap.text}
                          </p>
                          {cap.is_corrected && (
                            <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                              (Teacher Corrected)
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleStartCaptionEdit(cap.id, cap.text)}
                          title="Correct this caption segment"
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
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
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Lesson Progress & Sync</span>
              </h2>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                Section {currentSectionIndex + 1} of {activeLesson?.sections?.length || 1}
              </span>
            </div>

            <div className="space-y-2.5">
              {activeLesson?.sections?.map((sec, idx) => (
                <div
                  key={idx}
                  onClick={() => syncSection(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentSectionIndex === idx
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 dark:border-teal-400 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {sec.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {sec.content_text}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      syncSection(idx);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ml-2 ${
                      currentSectionIndex === idx
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {currentSectionIndex === idx ? 'Live' : 'Sync'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Student Questions & AAC Inbox */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>{t.teacher.studentQuestions} ({questions.length})</span>
              </h2>
            </div>

            {questions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No questions or AAC messages received yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2 ${
                      q.status === 'acknowledged'
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                        : q.status === 'answered'
                        ? 'bg-green-50/50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                        : 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {q.student_nickname}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.status === 'acknowledged'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : q.status === 'answered'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                      }`}>
                        {q.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      &ldquo;{q.content}&rdquo;
                    </p>

                    {q.response_text && (
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <strong>Your answer:</strong> {q.response_text}
                      </div>
                    )}

                    {q.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => acknowledgeQuestion(q.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 text-[11px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.teacher.acknowledge}</span>
                        </button>
                        <button
                          onClick={() => setAnsweringQuestionId(q.id)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold text-[11px]"
                        >
                          Answer Text
                        </button>
                      </div>
                    )}

                    {answeringQuestionId === q.id && (
                      <div className="mt-2 space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <input
                          type="text"
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type answer to broadcast to student..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setAnsweringQuestionId(null)}
                            className="px-2 py-1 text-[10px] text-slate-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendAnswer(q.id)}
                            className="px-3 py-1 bg-teal-600 text-white text-[10px] font-bold rounded-lg"
                          >
                            Send Answer
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h2 id="ann-modal-title" className="text-lg font-bold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <span>{t.teacher.announcementTitle}</span>
              </h2>
              <button
                onClick={() => setIsPublishingAnn(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(['General', 'Exam', 'Assignment', 'Timetable', 'Safety'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAnnCategory(cat)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        annCategory === cat
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Unit Test Next Monday"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Announcement Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="e.g. Please revise sections 1 to 4 on Earth's Revolution and Rotation..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishingAnn(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md"
                >
                  {t.teacher.publishBtn}
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
