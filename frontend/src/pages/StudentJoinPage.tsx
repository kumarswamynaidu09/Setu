import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { Radio, ArrowRight, Sparkles, User, KeyRound } from 'lucide-react';

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
      setError('Please enter a room code');
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
        throw new Error(data.detail || 'Could not join classroom');
      }

      // Save student session info
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
    <div className="max-w-md mx-auto py-12 px-4 text-slate-900 dark:text-slate-100">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-3xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Radio className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          {t.student.joinBtn}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Scan the blackboard QR code or enter your teacher's room code below.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {error && (
          <div
            role="alert"
            className="p-3 mb-5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label
              htmlFor="room-code-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-teal-600" />
              <span>{t.student.roomCodePrompt}</span>
            </label>
            <input
              id="room-code-input"
              type="text"
              required
              maxLength={10}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. SETU89"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xl font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label
              htmlFor="nickname-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-teal-600" />
              <span>{t.student.nicknamePrompt}</span>
            </label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Arya"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              No account required. Your nickname is only visible during this session.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-extrabold rounded-2xl shadow-md transition-all text-base flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-teal-500"
          >
            <span>{loading ? 'Joining Classroom...' : t.student.joinBtn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
