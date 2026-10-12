import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { PageHeader } from '../components/PageHeader';
import { BridgeMotif } from '../components/BridgeMotif';
import {
  KeyRound,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  QrCode
} from 'lucide-react';

interface StudentJoinPageProps {
  navigate: (route: string, data?: any) => void;
  prefilledCode?: string;
}

export const StudentJoinPage: React.FC<StudentJoinPageProps> = ({ navigate, prefilledCode }) => {
  const { t } = useAccessibility();
  const { joinRoom } = useLiveClassroom();
  const [roomCode, setRoomCode] = useState(prefilledCode || '');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefilledCode) {
      setRoomCode(prefilledCode);
    }
  }, [prefilledCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter your 6-character room code');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const cleanCode = roomCode.trim().toUpperCase();
      const res = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_code: cleanCode,
          student_nickname: nickname.trim() || 'Student'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not join classroom. Please check the code.');
      }

      localStorage.setItem('setu_student_token', data.student_token);
      localStorage.setItem('setu_student_session', JSON.stringify(data));

      joinRoom(data.session_id, data.room_code, 'student', nickname.trim() || 'Student');
      navigate('student-session', { sessionData: data });
    } catch (err: any) {
      setError(err.message || 'Unable to join classroom. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      <PageHeader
        title="Join a Classroom"
        subtitle="Enter the 6-character room code from your teacher's board to access live captions, audio, and lesson steps."
        badgeText="Zero Registration Required"
        badgeVariant="mint"
      />

      <div className="civic-card p-8 bg-white dark:bg-[#142738] shadow-sm space-y-6">
        
        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-sm font-semibold flex items-start gap-2.5"
          >
            <span className="shrink-0 font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-6">
          {/* Room Code Input */}
          <div className="space-y-2">
            <label
              htmlFor="room-code-input"
              className="block text-sm font-bold text-[#19324A] dark:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#0A625D]" />
                Classroom Code
              </span>
              <span className="text-xs text-[#526575] font-normal">
                Example: SETU89
              </span>
            </label>
            <input
              id="room-code-input"
              type="text"
              required
              maxLength={8}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ENTER ROOM CODE"
              className="w-full text-center tracking-widest text-2xl font-mono uppercase font-bold p-3.5 rounded-xl border-2 border-[#D8E2DC] dark:border-[#25435E] bg-[#F7F9F8] dark:bg-[#0E1B26] text-[#19324A] dark:text-white focus:border-[#0A625D] focus:outline-none transition-colors"
            />
          </div>

          {/* Student Nickname (Optional) */}
          <div className="space-y-2">
            <label
              htmlFor="student-nickname-input"
              className="block text-sm font-bold text-[#19324A] dark:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0A625D]" />
                Your First Name or Nickname (Optional)
              </span>
              <span className="text-xs text-[#526575] font-normal">
                No personal details needed
              </span>
            </label>
            <input
              id="student-nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Aarav, Priya"
              className="w-full p-3 text-base rounded-xl border border-[#D8E2DC] dark:border-[#25435E] bg-white dark:bg-[#0E1B26] text-[#19324A] dark:text-white focus:border-[#0A625D] focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-civic-primary py-3.5 text-base rounded-xl font-bold shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loading ? (
              <span>Connecting to Classroom...</span>
            ) : (
              <>
                <span>Enter Classroom</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Child Safety & Privacy Assurance */}
        <div className="pt-4 border-t border-[#E6ECE8] dark:border-[#1F364C] flex items-center justify-between text-xs text-[#526575] dark:text-[#9BB0C1]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0A625D]" />
            Zero child data tracking or profiling
          </span>
          <span>DPDP Act 2023 Compliant</span>
        </div>
      </div>
    </div>
  );
};
