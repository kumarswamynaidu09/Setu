import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { Radio, ArrowRight, User, KeyRound } from 'lucide-react';

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
    <div className="max-w-md mx-auto py-12 px-4 text-zinc-900 dark:text-zinc-100 font-body">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Radio className="w-5 h-5 text-red-500" />
        </div>
        <div className="nothing-label text-xs text-red-500 font-bold mb-1">
          [ ACCESS PORTAL // ZERO REGISTRATION ]
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading">
          {t.student.joinBtn}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Enter your teacher's 6-character room code or scan the projected QR.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm font-mono">
        {error && (
          <div
            role="alert"
            className="p-3 mb-5 rounded-xl bg-red-950/20 border border-red-500/80 text-red-600 dark:text-red-400 text-xs font-bold"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label
              htmlFor="room-code-input"
              className="nothing-label block text-xs text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-red-500" />
              <span>( 01 ) ROOM CODE (6 CHARACTERS)</span>
            </label>
            <input
              id="room-code-input"
              type="text"
              required
              maxLength={10}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="SETU89"
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-2xl font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-red-500 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label
              htmlFor="nickname-input"
              className="nothing-label block text-xs text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>( 02 ) TEMPORARY NICKNAME (OPTIONAL)</span>
            </label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Arya"
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              No account created. Data is discarded when the session ends.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 nothing-btn-primary text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{loading ? 'CONNECTING...' : 'ENTER LIVE ROOM'}</span>
            <ArrowRight className="w-4 h-4 text-red-500" />
          </button>
        </form>
      </div>
    </div>
  );
};
