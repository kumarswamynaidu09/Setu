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

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isListeningRef = useRef(false);

  // Buffer and timer to cleanly flush long continuous phrases without getting stuck
  const interimBufferRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const lastProcessedTextRef = useRef<string>('');

  const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
  const SpeechRecognitionAPI = win?.SpeechRecognition || win?.webkitSpeechRecognition;

  // Flush buffer if user pauses for more than 1.6 seconds without browser firing isFinal
  const flushCurrentSpeech = useCallback(() => {
    const raw = interimBufferRef.current.trim();
    if (raw && raw !== lastProcessedTextRef.current) {
      const enhanced = enhanceClassroomText(raw);
      lastProcessedTextRef.current = raw;
      interimBufferRef.current = '';
      setInterimText('');
      if (onInterimCaptured) onInterimCaptured('');
      onSegmentCaptured(enhanced, true);
    }
  }, [onInterimCaptured, onSegmentCaptured]);

  // Fallback: send audio chunks to backend if browser speech recognition is unsupported or fails
  const startBackendAudioCapture = useCallback(async (stream: MediaStream) => {
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')
        ? 'audio/ogg; codecs=opus'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 200 && sessionId && isListeningRef.current) {
          const formData = new FormData();
          formData.append('audio_file', e.data, 'chunk.wav');
          formData.append('session_id', sessionId);
          formData.append('language', language);
          try {
            const res = await fetch('/api/speech/transcribe-chunk', {
              method: 'POST',
              body: formData
            });
            if (res.ok) {
              const data = await res.json();
              if (data.text) {
                const enhanced = enhanceClassroomText(data.text);
                onSegmentCaptured(enhanced, true);
              }
            }
          } catch (err) {
            console.warn('Backend audio transcription error:', err);
          }
        }
      };

      recorder.start(3500); // 3.5s smooth intervals
      setActiveEngine('backend_audio');
    } catch (e) {
      console.warn('Could not start MediaRecorder fallback:', e);
    }
  }, [language, onSegmentCaptured, sessionId]);

  const initRecognition = useCallback(() => {
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3; // Allow engine to disambiguate intermediate words

    // Format language correctly for browser engine
    let langCode = 'en-IN';
    if (language.startsWith('hi')) langCode = 'hi-IN';
    else if (language.startsWith('te')) langCode = 'te-IN';
    else if (language.startsWith('en')) langCode = 'en-IN';
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

      // If speech engine declared a chunk final
      if (finalizedTranscript.trim()) {
        const enhanced = enhanceClassroomText(finalizedTranscript);
        lastProcessedTextRef.current = finalizedTranscript.trim();
        interimBufferRef.current = '';
        setInterimText('');
        if (onInterimCaptured) onInterimCaptured('');
        onSegmentCaptured(enhanced, true);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      }

      // Handle ongoing speech (interim)
      if (currentInterim.trim()) {
        interimBufferRef.current = currentInterim.trim();
        setInterimText(currentInterim);
        if (onInterimCaptured) {
          onInterimCaptured(currentInterim);
        }

        // Auto-flush interim if teacher takes a natural breath (1.6s pause)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isListeningRef.current && interimBufferRef.current.trim()) {
            flushCurrentSpeech();
          }
        }, 1600);
      }
    };

    recognition.onerror = (e: any) => {
      // Ignore common non-fatal events like no-speech
      if (e.error === 'no-speech') {
        return;
      }
      console.warn('Speech recognition status event:', e.error);

      if (e.error === 'network' || e.error === 'aborted') {
        // Quick reconnect rather than hard error
        if (isListeningRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {}
            }
          }, 300);
        }
      } else {
        setError(`Speech engine notice: ${e.error}`);
        if (sessionId && mediaStreamRef.current && activeEngine !== 'backend_audio') {
          startBackendAudioCapture(mediaStreamRef.current);
        }
      }
    };

    recognition.onend = () => {
      // Flush any lingering interim buffer before restarting
      if (interimBufferRef.current.trim()) {
        flushCurrentSpeech();
      }

      // Seamlessly keep microphone continuous so it never drops off after a few phrases
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (err) {
          // If restart fails, seamlessly fallback to backend capture
          if (sessionId && mediaStreamRef.current) {
            startBackendAudioCapture(mediaStreamRef.current);
          }
        }
      } else {
        setIsListening(false);
        setActiveEngine('idle');
      }
    };

    return recognition;
  }, [SpeechRecognitionAPI, activeEngine, flushCurrentSpeech, language, onInterimCaptured, onSegmentCaptured, sessionId, startBackendAudioCapture]);

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
        const recognition = initRecognition();
        recognitionRef.current = recognition;
        if (recognition) {
          try {
            recognition.start();
          } catch (err) {
            console.warn('Recognition start exception:', err);
          }
        }
      } else {
        if (sessionId) {
          startBackendAudioCapture(stream);
        } else {
          setError('Speech capture ready once room session connects.');
        }
      }
    } catch (err: any) {
      setHasMicPermission(false);
      setError('Microphone permission required. Please enable mic access.');
      setIsListening(false);
      isListeningRef.current = false;
      setActiveEngine('idle');
    }
  }, [SpeechRecognitionAPI, initRecognition, sessionId, startBackendAudioCapture]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setActiveEngine('idle');
    setInterimText('');
    if (onInterimCaptured) onInterimCaptured('');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (interimBufferRef.current.trim()) {
      flushCurrentSpeech();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, [flushCurrentSpeech, onInterimCaptured]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

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
