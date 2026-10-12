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

// Academic & Classroom vocabulary auto-enhancement
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
  const watchdogTimerRef = useRef<any>(null);

  const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
  const SpeechRecognitionAPI = win?.SpeechRecognition || win?.webkitSpeechRecognition;

  const createAndStart = useCallback(() => {
    if (!isListeningRef.current || !SpeechRecognitionAPI) return;

    try {
      // Abort old instance cleanly if still around
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

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

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';

          if (item.isFinal) {
            if (text.trim()) {
              const enhanced = enhanceClassroomText(text);
              setInterimText('');
              if (onInterimCapturedRef.current) onInterimCapturedRef.current('');
              onSegmentCapturedRef.current(enhanced, true);
            }
          } else {
            currentInterim += (currentInterim ? ' ' : '') + text;
          }
        }

        if (currentInterim.trim()) {
          setInterimText(currentInterim);
          if (onInterimCapturedRef.current) {
            onInterimCapturedRef.current(currentInterim);
          }
        }
      };

      recognition.onerror = (e: any) => {
        // 'no-speech' is triggered during natural silence; ignore it completely
        if (e.error === 'no-speech') return;
        
        console.warn('SpeechRecognition error event:', e.error);
        if (e.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone in browser.');
          isListeningRef.current = false;
          setIsListening(false);
          return;
        }

        // For network, aborted, or audio-capture glitches, schedule an immediate restart
        if (isListeningRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) createAndStart();
          }, 150);
        }
      };

      recognition.onend = () => {
        // INFINITE CONTINUOUS RECORDING:
        // When Chrome/Edge automatically closes the stream on quiet pauses,
        // immediately respawn a fresh session so the mic never goes dead!
        if (isListeningRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              createAndStart();
            }
          }, 50);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Recognition start exception, retrying:', err);
      if (isListeningRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (isListeningRef.current) createAndStart();
        }, 250);
      }
    }
  }, [SpeechRecognitionAPI]);

  const startListening = useCallback(async () => {
    setError(null);
    try {
      if (!SpeechRecognitionAPI) {
        setError('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
        return;
      }

      setHasMicPermission(true);
      isListeningRef.current = true;
      setIsListening(true);
      createAndStart();

      // Background watchdog: guarantees mic never stays off if browser quietly drops recognition
      if (watchdogTimerRef.current) clearInterval(watchdogTimerRef.current);
      watchdogTimerRef.current = setInterval(() => {
        if (isListeningRef.current && !recognitionRef.current) {
          createAndStart();
        }
      }, 2000);
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

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (watchdogTimerRef.current) {
      clearInterval(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (watchdogTimerRef.current) clearInterval(watchdogTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch (e) {}
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
