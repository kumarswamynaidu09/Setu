import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { StatusIndicator } from '../components/StatusIndicator';
import { BridgeMotif } from '../components/BridgeMotif';
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
  LogOut,
  Send,
  AlertCircle
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
    questions,
    currentSectionIndex,
    syncSection,
    publishAnnouncement,
    acknowledgeQuestion,
    answerQuestion,
    postCaption,
    correctCaption,
    endSession,
    joinRoom
  } = useLiveClassroom();

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(sessionData?.lesson || null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState('');

  // Manual caption fallback input
  const [manualCaptionInput, setManualCaptionInput] = useState('');

  // Announcement modal state
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'Assignment' | 'Exam' | 'Timetable' | 'Safety' | 'General'>('General');

  // Answering student question
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  // Ensure room connection is active
  useEffect(() => {
    if (!sessionId && sessionData?.id) {
      joinRoom(sessionData.id, sessionData.room_code, 'teacher', 'Teacher');
    }
  }, [joinRoom, sessionId, sessionData]);

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
    activeEngine,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onSegmentCaptured: handleSegmentCaptured,
    language,
    sessionId: sessionId || sessionData?.id
  });

  // Fetch full lesson if not provided
  useEffect(() => {
    const lid = sessionData?.lesson_id || sessionData?.lesson?.id;
    if (lid && !activeLesson) {
      fetch(`/api/lessons/${lid}`)
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

  const handleManualCaptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCaptionInput.trim()) return;
    await postCaption(manualCaptionInput.trim(), language);
    setManualCaptionInput('');
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
    setIsAnnouncing(false);
  };

  const handleSendAnswer = async (qId: string) => {
    if (!responseText.trim()) return;
    await answerQuestion(qId, responseText.trim());
    setAnsweringQuestionId(null);
    setResponseText('');
  };

  const handleEndClass = async () => {
    if (window.confirm('Are you sure you want to conclude this live classroom session?')) {
      stopListening();
      await endSession();
      navigate('teacher-dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Workspace Bar (Civic Calm) */}
      <div className="civic-card p-5 bg-white dark:bg-[#142738] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] dark:bg-[#0A625D]/30 flex items-center justify-center text-[#0A625D]">
            <BridgeMotif size="md" variant="teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#19324A] dark:text-white">
                Live Teacher Workspace
              </h1>
              <span className="badge-navy text-xs">
                Room: {roomCode || sessionData?.room_code || 'SETU'}
              </span>
            </div>
            <p className="text-xs text-[#526575] dark:text-[#9BB0C1] mt-0.5">
              {activeLesson?.title || 'Mainstream Inclusive Session'}
            </p>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F7F9F8] dark:bg-[#0E1B26] border border-[#D8E2DC] dark:border-[#25435E] text-xs font-bold text-[#19324A] dark:text-white">
            <Users className="w-4 h-4 text-[#0A625D]" />
            <span>{participantCount} Students Connected</span>
          </div>

          <button
            onClick={() => setIsQRModalOpen(true)}
            className="btn-civic-secondary text-xs py-2 px-3 rounded-lg"
          >
            <QrCode className="w-4 h-4 text-[#0A625D]" />
            <span>Project QR</span>
          </button>

          <button
            onClick={() => setIsAnnouncing(true)}
            className="btn-civic-secondary text-xs py-2 px-3 rounded-lg"
          >
            <Megaphone className="w-4 h-4 text-[#B07822]" />
            <span>Announce</span>
          </button>

          <button
            onClick={handleEndClass}
            className="text-xs font-semibold py-2 px-3 rounded-lg bg-[#C53030] hover:bg-[#9B1C1C] text-white flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Class</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Microphone Capture & Live Transcripts */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Real-time Audio Capture Panel */}
          <div className="civic-card p-6 bg-[#19324A] text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-[#B07822] text-white animate-pulse'
                    : 'bg-[#142738] text-slate-300'
                }`}>
                  {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <StatusIndicator
                      status={isListening ? 'listening' : 'idle'}
                      label={isListening ? 'Capturing Microphone' : 'Microphone on Standby'}
                    />
                  </div>
                  <h2 className="text-base font-bold mt-0.5">
                    {isListening ? 'Transcribing classroom speech...' : 'Press Start to begin live captioning'}
                  </h2>
                </div>
              </div>

              <button
                onClick={handleToggleMic}
                className={`py-2.5 px-6 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${
                  isListening
                    ? 'bg-[#C53030] hover:bg-[#9B1C1C] text-white'
                    : 'bg-[#0A625D] hover:bg-[#084E4A] text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Stop Mic' : 'Start Speech'}</span>
              </button>
            </div>

            {/* Interim Transcript Live Preview */}
            {isListening && interimText && (
              <div className="p-3 bg-[#142738] rounded-xl border border-[#25435E] text-xs text-teal-200 flex items-center gap-2">
                <span className="live-pulse shrink-0" />
                <span className="truncate">Processing: {interimText}</span>
              </div>
            )}

            {micError && (
              <div className="p-3 bg-[#9B1C1C]/40 border border-[#F8B4B4] rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {/* Direct manual caption input for testing or quiet situations */}
            <form onSubmit={handleManualCaptionSubmit} className="pt-2 flex gap-2">
              <input
                type="text"
                value={manualCaptionInput}
                onChange={(e) => setManualCaptionInput(e.target.value)}
                placeholder="Or type a spoken explanation or key formula to broadcast..."
                className="flex-1 p-2.5 rounded-lg bg-[#142738] border border-[#25435E] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0A625D]"
              />
              <button
                type="submit"
                className="btn-civic-primary text-xs py-2 px-3 rounded-lg shrink-0"
              >
                <span>Broadcast</span>
              </button>
            </form>
          </div>

          {/* Transcript History & Correction Panel */}
          <div className="civic-card p-6 bg-white dark:bg-[#142738] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#0A625D]" />
                <h3 className="font-bold text-base text-[#19324A] dark:text-white">
                  Live Caption History ({captions.length})
                </h3>
              </div>
              <span className="text-xs text-[#526575]">
                Click pencil to correct text
              </span>
            </div>

            {captions.length === 0 ? (
              <div className="py-12 text-center text-[#526575] space-y-1">
                <p className="text-sm">No spoken captions yet.</p>
                <p className="text-xs">Start speaking with the microphone above to stream live text to student devices.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2">
                {captions.map((cap) => (
                  <div
                    key={cap.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      cap.is_corrected
                        ? 'bg-[#FEF7EE] dark:bg-[#19324A] border-[#F6D8A8]'
                        : 'bg-[#F7F9F8] dark:bg-[#0E1B26] border-[#D8E2DC] dark:border-[#25435E]'
                    }`}
                  >
                    {editingCaptionId === cap.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editingCaptionText}
                          onChange={(e) => setEditingCaptionText(e.target.value)}
                          className="w-full p-2 text-sm rounded-lg border border-[#0A625D] bg-white dark:bg-[#142738] focus:outline-none"
                        />
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => setEditingCaptionId(null)}
                            className="px-2.5 py-1 text-[#526575] hover:text-[#19324A]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveCaptionEdit(cap.id)}
                            className="btn-civic-primary py-1 px-3 rounded-lg text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save & Broadcast Correction</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] text-[#526575] mb-0.5">
                            Segment {cap.segment_index}
                          </div>
                          <p className="text-sm text-[#19324A] dark:text-white leading-relaxed">
                            {cap.text}
                          </p>
                          {cap.is_corrected && (
                            <span className="badge-saffron text-[10px] mt-1 inline-flex">
                              ✓ Corrected by Teacher
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleStartCaptionEdit(cap.id, cap.text)}
                          title="Correct caption text"
                          className="p-1.5 text-[#526575] hover:text-[#0A625D] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Lesson Progress Sync & Student Inquiries */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Lesson Synchronization Card */}
          <div className="civic-card p-6 bg-white dark:bg-[#142738] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0A625D]" />
                <h3 className="font-bold text-base text-[#19324A] dark:text-white">
                  Lesson Sections & Progress
                </h3>
              </div>
              <span className="badge-mint text-xs">
                Step {currentSectionIndex + 1} of {activeLesson?.sections?.length || 1}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {activeLesson?.sections?.map((sec, idx) => {
                const isCurrent = idx === currentSectionIndex;
                return (
                  <button
                    key={sec.id || idx}
                    onClick={() => syncSection(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#E8F5F2] dark:bg-[#0A625D]/30 border-[#0A625D] font-bold text-[#0A625D] dark:text-teal-200'
                        : 'bg-[#F7F9F8] dark:bg-[#0E1B26] border-[#D8E2DC] dark:border-[#25435E] text-[#19324A] dark:text-[#F0F6F5] hover:bg-[#E8F5F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isCurrent ? 'bg-[#0A625D] text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm truncate max-w-[200px]">
                        {sec.title}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="text-[11px] text-[#0A625D] font-bold">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Questions & AAC Responses */}
          <div className="civic-card p-6 bg-white dark:bg-[#142738] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#B07822]" />
                <h3 className="font-bold text-base text-[#19324A] dark:text-white">
                  Student Inquiries & AAC ({questions.length})
                </h3>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#526575]">
                No student inquiries yet. Non-verbal AAC phrases and questions appear here.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-[#D8E2DC] dark:border-[#25435E] bg-[#F7F9F8] dark:bg-[#0E1B26] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#19324A] dark:text-white">
                        {q.student_nickname || 'Student'}
                      </span>
                      <span className={q.message_type === 'aac_phrase' ? 'badge-saffron text-[10px]' : 'badge-mint text-[10px]'}>
                        {q.message_type === 'aac_phrase' ? 'AAC Phrase' : 'Question'}
                      </span>
                    </div>

                    <p className="text-xs text-[#19324A] dark:text-white font-medium">
                      "{q.content}"
                    </p>

                    {q.status === 'answered' && q.response_text && (
                      <div className="text-[11px] text-[#0A625D] bg-[#E8F5F2] p-2 rounded-lg">
                        <strong>Answered:</strong> {q.response_text}
                      </div>
                    )}

                    {q.status !== 'answered' && (
                      <div className="pt-1 flex items-center justify-end gap-2 text-xs">
                        {q.status === 'pending' && (
                          <button
                            onClick={() => acknowledgeQuestion(q.id)}
                            className="text-[#0A625D] hover:underline font-semibold"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => setAnsweringQuestionId(q.id)}
                          className="btn-civic-primary py-1 px-2.5 text-xs rounded-lg"
                        >
                          Answer
                        </button>
                      </div>
                    )}

                    {/* Answer input form */}
                    {answeringQuestionId === q.id && (
                      <div className="pt-2 flex gap-1.5">
                        <input
                          type="text"
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type answer to broadcast back..."
                          className="flex-1 p-2 text-xs rounded-lg border border-[#0A625D] bg-white dark:bg-[#142738]"
                        />
                        <button
                          onClick={() => handleSendAnswer(q.id)}
                          className="btn-civic-primary text-xs py-1 px-3 rounded-lg"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projection QR Code Modal */}
      {isQRModalOpen && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          roomCode={roomCode || sessionData?.room_code || 'SETU'}
          classNameTitle={activeLesson?.title || 'Interactive Inclusive Lesson'}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}

      {/* Teacher Announcement Modal */}
      {isAnnouncing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="civic-card bg-white dark:bg-[#142738] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6ECE8]">
              <h3 className="font-bold text-base text-[#19324A] dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#B07822]" />
                <span>Classroom Announcement</span>
              </h3>
              <button
                onClick={() => setIsAnnouncing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#19324A] dark:text-white mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g., Homework due Friday"
                  className="w-full p-2.5 rounded-lg border border-[#D8E2DC] dark:border-[#25435E] bg-white dark:bg-[#0E1B26]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#19324A] dark:text-white mb-1">
                  Announcement Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Explain clearly to all students..."
                  className="w-full p-2.5 rounded-lg border border-[#D8E2DC] dark:border-[#25435E] bg-white dark:bg-[#0E1B26]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAnnouncing(false)}
                  className="px-4 py-2 text-xs text-[#526575] hover:text-[#19324A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-civic-primary py-2 px-5 text-xs rounded-lg"
                >
                  Publish to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
