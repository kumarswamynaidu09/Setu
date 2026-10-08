import { useState, useEffect, useRef, useCallback } from 'react';

// Extended Web Speech API interfaces
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

interface UseSpeechRecognitionProps {
  onSegmentCaptured: (text: string, isFinal: boolean) => void;
  language?: string;
}

export const useSpeechRecognition = ({ onSegmentCaptured, language = 'en-IN' }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
  const SpeechRecognitionAPI = win?.SpeechRecognition || win?.webkitSpeechRecognition;

  const startListening = useCallback(async () => {
    setError(null);
    try {
      // First request explicit microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasMicPermission(true);

      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
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
          console.warn('Speech recognition error event:', e);
          if (e.error !== 'no-speech') {
            setError(`Speech recognition notice: ${e.error}`);
          }
        };

        recognition.onend = () => {
          // If still marked listening, restart recognition automatically
          if (recognitionRef.current && isListening) {
            try {
              recognition.start();
            } catch (err) {
              setIsListening(false);
            }
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      } else {
        setError('Browser native speech recognition API not available in this browser. Please use Chrome/Edge or audio chunk streaming.');
        setIsListening(true);
      }
    } catch (err: any) {
      setHasMicPermission(false);
      setError('Microphone access denied or not available. Please allow microphone permissions.');
      setIsListening(false);
    }
  }, [SpeechRecognitionAPI, isListening, language, onSegmentCaptured]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setInterimText('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
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
    startListening,
    stopListening,
    isSupported: !!SpeechRecognitionAPI
  };
};
