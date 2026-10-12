import React, { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onSegmentCaptured: (text: string, isFinal: boolean) => void;
  language?: string;
  sessionId?: string | null;
}

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export const useSpeechRecognition = ({
  onSegmentCaptured,
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

  const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
  const SpeechRecognitionAPI = win?.SpeechRecognition || win?.webkitSpeechRecognition;

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
                onSegmentCaptured(data.text, true);
              }
            }
          } catch (err) {
            console.warn('Backend audio transcription error:', err);
          }
        }
      };

      recorder.start(4000); // 4-second intervals
      setActiveEngine('backend_audio');
    } catch (e) {
      console.warn('Could not start MediaRecorder fallback:', e);
    }
  }, [language, onSegmentCaptured, sessionId]);

  const startListening = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;
      setHasMicPermission(true);
      isListeningRef.current = true;
      setIsListening(true);

      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setActiveEngine('browser_api');
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              if (transcript.trim()) {
                onSegmentCaptured(transcript.trim(), true);
              }
            } else {
              interim += transcript;
            }
          }
          setInterimText(interim);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition event:', e.error);
          if (e.error !== 'no-speech') {
            setError(`Recognition note: ${e.error}`);
            // Fall back to server audio streaming if browser service fails
            if (sessionId && mediaStreamRef.current && activeEngine !== 'backend_audio') {
              startBackendAudioCapture(mediaStreamRef.current);
            }
          }
        };

        recognition.onend = () => {
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch (err) {
              if (sessionId && mediaStreamRef.current) {
                startBackendAudioCapture(mediaStreamRef.current);
              }
            }
          } else {
            setIsListening(false);
            setActiveEngine('idle');
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        // Browser does not have webkitSpeechRecognition -> use backend audio capture
        if (sessionId) {
          startBackendAudioCapture(stream);
        } else {
          setError('Browser speech recognition unavailable. Speech will stream once session starts.');
        }
      }
    } catch (err: any) {
      setHasMicPermission(false);
      setError('Microphone permission denied or audio device not found. Please enable microphone permissions in your browser.');
      setIsListening(false);
      isListeningRef.current = false;
      setActiveEngine('idle');
    }
  }, [SpeechRecognitionAPI, activeEngine, language, onSegmentCaptured, sessionId, startBackendAudioCapture]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setActiveEngine('idle');
    setInterimText('');

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
  }, []);

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
