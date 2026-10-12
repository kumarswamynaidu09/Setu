import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

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
      setError('Please enter your classroom room code');
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
        throw new Error(data.detail || 'Classroom not found. Please verify the code.');
      }

      localStorage.setItem('setu_student_token', data.student_token);
      localStorage.setItem('setu_student_session', JSON.stringify(data));

      joinRoom(data.session_id, data.room_code, 'student', nickname.trim() || 'Student');
      navigate('student-session', { sessionData: data });
    } catch (err: any) {
      setError(err.message || 'Unable to join classroom. Check code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Join a Classroom
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Enter the room code shared by your teacher to access live captions, audio, and lesson steps.
        </p>
      </div>

      {/* iOS Clean Card */}
      <div className="ios-card p-7 space-y-6">
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          {/* Room Code */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <label htmlFor="room-code-input">Classroom Code</label>
              <span className="text-slate-400 font-normal">e.g. SETU89</span>
            </div>
            <input
              id="room-code-input"
              type="text"
              required
              maxLength={8}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              className="ios-input w-full text-center tracking-widest text-2xl font-bold uppercase placeholder:text-slate-300"
            />
          </div>

          {/* Nickname */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <label htmlFor="student-nickname-input">Your First Name (Optional)</label>
              <span className="text-slate-400 font-normal">No password needed</span>
            </div>
            <input
              id="student-nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Aarav, Priya"
              className="ios-input w-full"
            />
          </div>

          {/* Enter Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-ios-primary w-full py-3.5 text-base font-semibold"
          >
            {loading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <span>Enter Classroom</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          Zero data collected • No permanent account required
        </div>
      </div>
    </div>
  );
};
