import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CaptionSegment, Announcement, StudentQuestion, LiveSession, LessonSection } from '../types';

interface LiveClassroomContextType {
  sessionId: string | null;
  roomCode: string | null;
  role: 'teacher' | 'student';
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  participantCount: number;
  currentSectionIndex: number;
  captions: CaptionSegment[];
  announcements: Announcement[];
  questions: StudentQuestion[];
  latestAnnouncement: Announcement | null;
  setLatestAnnouncement: (a: Announcement | null) => void;
  isSessionActive: boolean;
  
  // Actions
  joinRoom: (sessionId: string, roomCode: string, role: 'teacher' | 'student', nickname?: string) => void;
  leaveRoom: () => void;
  syncSection: (index: number) => Promise<void>;
  publishAnnouncement: (title: string, content: string, category?: string, priority?: 'normal' | 'urgent') => Promise<void>;
  submitQuestion: (content: string, type?: 'aac_phrase' | 'custom_text' | 'clarification', nickname?: string) => Promise<void>;
  acknowledgeQuestion: (questionId: string) => Promise<void>;
  answerQuestion: (questionId: string, responseText: string) => Promise<void>;
  postCaption: (text: string, language?: string) => Promise<void>;
  correctCaption: (segmentId: string, correctedText: string) => Promise<void>;
  endSession: () => Promise<void>;
}

const LiveClassroomContext = createContext<LiveClassroomContextType | undefined>(undefined);

export const LiveClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [studentNickname, setStudentNickname] = useState<string>('Student');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(true);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<any>(null);

  // Load existing session details
  const fetchSessionDetails = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/sessions/active/${sid}`);
      if (res.ok) {
        const data = await res.json();
        setCaptions(data.captions || []);
        setAnnouncements(data.announcements || []);
        setQuestions(data.questions || []);
        if (data.session) {
          setCurrentSectionIndex(data.session.current_section_index || 0);
          setIsSessionActive(data.session.is_active);
          setRoomCode(data.session.room_code);
        }
      }
    } catch (e) {
      console.warn('Could not fetch active session data:', e);
    }
  }, []);

  const connectWebSocket = useCallback((sid: string, currentRole: 'teacher' | 'student', nickname: string) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/live/${sid}?role=${currentRole}&nickname=${encodeURIComponent(nickname)}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'CAPTION_NEW':
            if (data.caption) {
              setCaptions(prev => {
                if (prev.some(c => c.id === data.caption.id)) return prev;
                return [...prev, data.caption];
              });
            }
            break;

          case 'CAPTION_CORRECTED':
            if (data.caption) {
              setCaptions(prev => prev.map(c => c.id === data.caption.id ? data.caption : c));
            }
            break;

          case 'SECTION_CHANGED':
            if (typeof data.current_section_index === 'number') {
              setCurrentSectionIndex(data.current_section_index);
            }
            break;

          case 'ANNOUNCEMENT_NEW':
            if (data.announcement) {
              setAnnouncements(prev => [data.announcement, ...prev]);
              setLatestAnnouncement(data.announcement);
            }
            break;

          case 'QUESTION_NEW':
            if (data.question) {
              setQuestions(prev => [data.question, ...prev]);
            }
            break;

          case 'QUESTION_ACKNOWLEDGED':
            setQuestions(prev => prev.map(q => q.id === data.question_id ? { ...q, status: 'acknowledged' } : q));
            break;

          case 'QUESTION_ANSWERED':
            setQuestions(prev => prev.map(q => q.id === data.question_id ? { ...q, status: 'answered', response_text: data.response_text } : q));
            break;

          case 'PARTICIPANT_UPDATE':
            if (typeof data.participant_count === 'number') {
              setParticipantCount(data.participant_count);
            }
            break;

          case 'SESSION_ENDED':
            setIsSessionActive(false);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    ws.onerror = () => {
      setConnectionStatus('reconnecting');
    };

    ws.onclose = () => {
      if (sessionId) {
        setConnectionStatus('reconnecting');
        reconnectTimerRef.current = setTimeout(() => {
          connectWebSocket(sid, currentRole, nickname);
        }, 3000);
      } else {
        setConnectionStatus('disconnected');
      }
    };

    socketRef.current = ws;
  }, [sessionId]);

  const joinRoom = useCallback((sid: string, code: string, userRole: 'teacher' | 'student', nickname: string = 'Student') => {
    setSessionId(sid);
    setRoomCode(code);
    setRole(userRole);
    setStudentNickname(nickname);
    setIsSessionActive(true);
    fetchSessionDetails(sid);
    connectWebSocket(sid, userRole, nickname);
  }, [connectWebSocket, fetchSessionDetails]);

  const leaveRoom = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setSessionId(null);
    setRoomCode(null);
    setConnectionStatus('disconnected');
    setCaptions([]);
    setAnnouncements([]);
    setQuestions([]);
    setLatestAnnouncement(null);
  }, []);

  const syncSection = async (index: number) => {
    if (!sessionId) return;
    const token = localStorage.getItem('setu_auth_token');
    await fetch(`/api/sessions/${sessionId}/sync-section`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ current_section_index: index })
    });
    setCurrentSectionIndex(index);
  };

  const publishAnnouncement = async (title: string, content: string, category: string = 'General', priority: 'normal' | 'urgent' = 'normal') => {
    if (!sessionId) return;
    const token = localStorage.getItem('setu_auth_token');
    await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        session_id: sessionId,
        title,
        content,
        category,
        priority
      })
    });
  };

  const submitQuestion = async (content: string, type: 'aac_phrase' | 'custom_text' | 'clarification' = 'aac_phrase', nickname?: string) => {
    if (!sessionId) return;
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        student_nickname: nickname || studentNickname,
        message_type: type,
        content
      })
    });
  };

  const acknowledgeQuestion = async (questionId: string) => {
    const token = localStorage.getItem('setu_auth_token');
    await fetch('/api/questions/acknowledge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ question_id: questionId })
    });
  };

  const answerQuestion = async (questionId: string, responseText: string) => {
    const token = localStorage.getItem('setu_auth_token');
    await fetch('/api/questions/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ question_id: questionId, response_text: responseText })
    });
  };

  const postCaption = async (text: string, language: string = 'en') => {
    if (!sessionId) return;
    const token = localStorage.getItem('setu_auth_token');
    const segmentIndex = captions.length + 1;
    await fetch('/api/speech/captions/manual-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        session_id: sessionId,
        segment_index: segmentIndex,
        text,
        language
      })
    });
  };

  const correctCaption = async (segmentId: string, correctedText: string) => {
    const token = localStorage.getItem('setu_auth_token');
    await fetch('/api/speech/captions/correct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        segment_id: segmentId,
        corrected_text: correctedText
      })
    });
  };

  const endSession = async () => {
    if (!sessionId) return;
    const token = localStorage.getItem('setu_auth_token');
    await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    setIsSessionActive(false);
  };

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  return (
    <LiveClassroomContext.Provider value={{
      sessionId,
      roomCode,
      role,
      connectionStatus,
      participantCount,
      currentSectionIndex,
      captions,
      announcements,
      questions,
      latestAnnouncement,
      setLatestAnnouncement,
      isSessionActive,
      joinRoom,
      leaveRoom,
      syncSection,
      publishAnnouncement,
      submitQuestion,
      acknowledgeQuestion,
      answerQuestion,
      postCaption,
      correctCaption,
      endSession
    }}>
      {children}
    </LiveClassroomContext.Provider>
  );
};

export const useLiveClassroom = () => {
  const context = useContext(LiveClassroomContext);
  if (!context) {
    throw new Error('useLiveClassroom must be used within a LiveClassroomProvider');
  }
  return context;
};
