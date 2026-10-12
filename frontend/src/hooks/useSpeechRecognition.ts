import React, { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onSegmentCaptured: (text: string, isFinal: boolean) => void;
  onInterimCaptured?: (text: string) => void;
  language?: string;
  sessionId?: string | null;
}

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

const CLASSROOM_TERMS: Record<string, string> = {
  'solar sistam': 'Solar System',
  'solar sistum': 'Solar System',
  'soler system': 'Solar System',
  'photosinthesis': 'photosynthesis',
  'photo synthesis': 'photosynthesis',
  'chlorophil': 'chlorophyll',
  'clorophil': 'chlorophyll',
  'rotashun': 'rotation',
  'revolution': 'revolution',
  'grawity': 'gravity',
  'gravitational': 'gravitational',
  'ekuator': 'equator',
  'hemisfere': 'hemisphere',
  'atmospere': 'atmosphere',
  'atmosfear': 'atmosphere',
  'jupitar': 'Jupiter',
  'satren': 'Saturn',
  'mercry': 'Mercury',
  'venus': 'Venus',
  'neptun': 'Neptune',
  'uranus': 'Uranus',
  'pluto': 'Pluto',
  'orbit': 'orbit',
  'axis': 'axis',
  'celestial': 'celestial',
  'constellation': 'constellation',
  'evaporation': 'evaporation',
  'condensation': 'condensation',
  'precipitation': 'precipitation',
  'respiration': 'respiration',
  'mitochondria': 'mitochondria',
  'ecosystem': 'ecosystem'
};

const enhanceClassroomText = (raw: string): string => {
  let cleaned = raw.trim();
  if (!cleaned) return '';

  for (const [key, replacement] of Object.entries(CLASSROOM_TERMS)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    cleaned = cleaned.replace(regex, replacement);
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export const useSpeechRecognition = ({
  onSegmentCaptured,
  onInterimCaptured,
  language = 'en-IN',
  sessionId
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const onSegmentCapturedRef = useRef(onSegmentCaptured);
  onSegmentCapturedRef.current = onSegmentCaptured;

  const onInterimCapturedRef = useRef(onInterimCaptured);
  onInterimCapturedRef.current = onInterimCaptured;

  const languageRef = useRef(language);
  languageRef.current = language;

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const restartTimerRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const interimBufferRef = useRef<string>('');

  const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
  const SpeechRecognitionAPI = win?.SpeechRecognition || win?.webkitSpeechRecognition;

  const flushBuffer = useCallback(() => {
    const raw = interimBufferRef.current.trim();
    if (raw) {
      const enhanced = enhanceClassroomText(raw);
      interimBufferRef.current = '';
      setInterimText('');
      if (onInterimCapturedRef.current) onInterimCapturedRef.current('');
      onSegmentCapturedRef.current(enhanced, true);
    }
  }, []);

  const createAndStart = useCallback(() => {
    if (!isListeningRef.current || !SpeechRecognitionAPI) return;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;

      let langCode = 'en-IN';
      if (languageRef.current.startsWith('hi')) langCode = 'hi-IN';
      else if (languageRef.current.startsWith('te')) langCode = 'te-IN';
      else if (languageRef.current.startsWith('en')) langCode = 'en-IN';
      recognition.lang = langCode;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalized = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalized += (finalized ? ' ' : '') + text;
          } else {
            currentInterim += (currentInterim ? ' ' : '') + text;
          }
        }

        if (finalized.trim()) {
          const enhanced = enhanceClassroomText(finalized);
          interimBufferRef.current = '';
          setInterimText('');
          if (onInterimCapturedRef.current) onInterimCapturedRef.current('');
          onSegmentCapturedRef.current(enhanced, true);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        }

        if (currentInterim.trim()) {
          interimBufferRef.current = currentInterim.trim();
          setInterimText(currentInterim);
          if (onInterimCapturedRef.current) onInterimCapturedRef.current(currentInterim);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && interimBufferRef.current.trim()) {
              flushBuffer();
            }
          }, 1500);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech') return;
        console.warn('SpeechRecognition error:', e.error);
        if (e.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone in browser.');
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (interimBufferRef.current.trim()) {
          flushBuffer();
        }

        // As long as the user hasn't pressed "Stop Mic", continuously restart!
        if (isListeningRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              createAndStart();
            }
          }, 150);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Recognition start exception:', err);
      if (isListeningRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (isListeningRef.current) createAndStart();
        }, 300);
      }
    }
  }, [SpeechRecognitionAPI, flushBuffer]);

  const startListening = useCallback(async () => {
    setError(null);
    try {
      // 1. Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop media tracks from getUserMedia immediately - Web Speech API will handle mic stream directly
      stream.getTracks().forEach((track) => track.stop());

      setHasMicPermission(true);
      isListeningRef.current = true;
      setIsListening(true);

      if (SpeechRecognitionAPI) {
        createAndStart();
      } else {
        setError('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      }
    } catch (err: any) {
      setHasMicPermission(false);
      setError('Microphone access blocked. Click the lock/tune icon near the URL bar to allow microphone.');
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [SpeechRecognitionAPI, createAndStart]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimText('');
    if (onInterimCapturedRef.current) onInterimCapturedRef.current('');

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

    if (interimBufferRef.current.trim()) {
      flushBuffer();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, [flushBuffer]);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  return {
    isListening,
    interimText,
    error,
    hasMicPermission,
    startListening,
    stopListening,
    isSupported: !!SpeechRecognitionAPI
  };
};
