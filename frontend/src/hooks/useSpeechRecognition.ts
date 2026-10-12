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

// Classroom science, math, and social terms enhancement dictionary
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

  // Capitalize first letter of sentence
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
  const [activeEngine, setActiveEngine] = useState<'browser_api' | 'backend_audio' | 'idle'>('idle');

  // Stable refs for callbacks so recognition never needs to teardown on state/prop re-render
  const onSegmentCapturedRef = useRef(onSegmentCaptured);
  onSegmentCapturedRef.current = onSegmentCaptured;

  const onInterimCapturedRef = useRef(onInterimCaptured);
  onInterimCapturedRef.current = onInterimCaptured;

  const languageRef = useRef(language);
  languageRef.current = language;

  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isListeningRef = useRef(false);

  // Buffer and timer to cleanly flush speech when user pauses
  const interimBufferRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);

  const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
  const SpeechRecognitionAPI = win?.SpeechRecognition || win?.webkitSpeechRecognition;

  // Flush buffer if user pauses for more than 1.4 seconds without browser firing isFinal
  const flushCurrentSpeech = useCallback(() => {
    const raw = interimBufferRef.current.trim();
    if (raw) {
      const enhanced = enhanceClassroomText(raw);
      interimBufferRef.current = '';
      setInterimText('');
      if (onInterimCapturedRef.current) onInterimCapturedRef.current('');
      onSegmentCapturedRef.current(enhanced, true);
    }
  }, []);

  // Safe continuous restart function
  const safeRestart = useCallback(() => {
    if (!isListeningRef.current || !SpeechRecognitionAPI) return;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

    restartTimerRef.current = setTimeout(() => {
      if (!isListeningRef.current) return;
      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {}
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        let langCode = 'en-IN';
        if (languageRef.current.startsWith('hi')) langCode = 'hi-IN';
        else if (languageRef.current.startsWith('te')) langCode = 'te-IN';
        else if (languageRef.current.startsWith('en')) langCode = 'en-IN';
        recognition.lang = langCode;

        recognition.onstart = () => {
          setIsListening(true);
          setActiveEngine('browser_api');
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalizedTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const item = event.results[i];
            const text = item[0]?.transcript || '';

            if (item.isFinal) {
              finalizedTranscript += (finalizedTranscript ? ' ' : '') + text;
            } else {
              currentInterim += (currentInterim ? ' ' : '') + text;
            }
          }

          if (finalizedTranscript.trim()) {
            const enhanced = enhanceClassroomText(finalizedTranscript);
            interimBufferRef.current = '';
            setInterimText('');
            if (onInterimCapturedRef.current) onInterimCapturedRef.current('');
            onSegmentCapturedRef.current(enhanced, true);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          }

          if (currentInterim.trim()) {
            interimBufferRef.current = currentInterim.trim();
            setInterimText(currentInterim);
            if (onInterimCapturedRef.current) {
              onInterimCapturedRef.current(currentInterim);
            }

            // Flush interim if teacher takes a natural breath (1.4s pause)
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (isListeningRef.current && interimBufferRef.current.trim()) {
                flushCurrentSpeech();
              }
            }, 1400);
          }
        };

        recognition.onerror = (e: any) => {
          if (e.error === 'no-speech') {
            // Normal silence; do not stop
            return;
          }
          console.warn('Speech recognition notice:', e.error);
          if (isListeningRef.current) {
            safeRestart();
          }
        };

        recognition.onend = () => {
          // Flush any pending interim speech
          if (interimBufferRef.current.trim()) {
            flushCurrentSpeech();
          }

          // In Chrome/Edge, continuous recognition ends periodically or after silence.
          // Immediately restart so the teacher's mic stays ON indefinitely until manually stopped!
          if (isListeningRef.current) {
            safeRestart();
          } else {
            setIsListening(false);
            setActiveEngine('idle');
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Recognition start exception, retrying in 400ms:', err);
        if (isListeningRef.current) {
          restartTimerRef.current = setTimeout(safeRestart, 400);
        }
      }
    }, 150);
  }, [SpeechRecognitionAPI, flushCurrentSpeech]);

  const startListening = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000
        }
      });
      mediaStreamRef.current = stream;
      setHasMicPermission(true);
      isListeningRef.current = true;
      setIsListening(true);

      if (SpeechRecognitionAPI) {
        safeRestart();
      } else {
        setError('Browser Web Speech API not supported. Use Chrome or Edge.');
      }
    } catch (err: any) {
      setHasMicPermission(false);
      setError('Microphone permission required. Please enable mic access.');
      setIsListening(false);
      isListeningRef.current = false;
      setActiveEngine('idle');
    }
  }, [SpeechRecognitionAPI, safeRestart]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setActiveEngine('idle');
    setInterimText('');
    if (onInterimCapturedRef.current) onInterimCapturedRef.current('');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (interimBufferRef.current.trim()) {
      flushCurrentSpeech();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, [flushCurrentSpeech]);

  // Clean unmount only
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isListening,
    interimText,
    error,
    hasMicPermission,
    activeEngine,
    startListening,
    stopListening,
    isSupported: !!SpeechRecognitionAPI
  };
};
