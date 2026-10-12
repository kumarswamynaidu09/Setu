import io
import time
import logging
import wave
from typing import Dict, Any, Optional
import speech_recognition as sr

logger = logging.getLogger("setu.speech")

class SpeechProcessingService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        # Optimize recognizer for classroom speech
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        
        # Classroom vocabulary enhancement mapping for intermediate academic terms
        self.term_corrections = {
            "solar sistam": "Solar System",
            "solar sistum": "Solar System",
            "soler system": "Solar System",
            "earth revolvs": "Earth revolves",
            "revolution": "revolution",
            "rotashun": "rotation",
            "grawity": "gravity",
            "gravitational": "gravitational",
            "mercury venus": "Mercury, Venus",
            "jupitar": "Jupiter",
            "satren": "Saturn",
            "mercry": "Mercury",
            "neptun": "Neptune",
            "photosinthesis": "photosynthesis",
            "photo synthesis": "photosynthesis",
            "chlorophil": "chlorophyll",
            "clorophil": "chlorophyll",
            "ekuator": "equator",
            "hemisfere": "hemisphere",
            "atmospere": "atmosphere",
            "atmosfear": "atmosphere",
            "celestial": "celestial",
            "constellation": "constellation",
            "evaporation": "evaporation",
            "condensation": "condensation",
            "precipitation": "precipitation",
            "respiration": "respiration",
            "mitochondria": "mitochondria",
            "ecosystem": "ecosystem"
        }

    def process_audio_chunk(self, audio_bytes: bytes, language: str = "en-IN") -> Dict[str, Any]:
        """
        Process a chunk of audio bytes and return transcribed text with latency timing.
        Supports WAV / PCM chunk format.
        """
        start_time = time.time()
        try:
            # Check if bytes are valid audio
            if len(audio_bytes) < 100:
                return {
                    "success": False,
                    "text": "",
                    "error": "Audio chunk too small or silent",
                    "latency_ms": int((time.time() - start_time) * 1000)
                }

            audio_file = io.BytesIO(audio_bytes)
            with sr.AudioFile(audio_file) as source:
                audio_data = self.recognizer.record(source)

            # Map language code
            lang_code = "en-IN"
            if language.startswith("hi"):
                lang_code = "hi-IN"
            elif language.startswith("te"):
                lang_code = "te-IN"
            elif language.startswith("en"):
                lang_code = "en-IN"

            # Recognize using speech recognition engine
            try:
                raw_text = self.recognizer.recognize_google(audio_data, language=lang_code)
            except sr.UnknownValueError:
                return {
                    "success": True,
                    "text": "", # Silence or unparseable background noise
                    "latency_ms": int((time.time() - start_time) * 1000)
                }
            except sr.RequestError as e:
                # Network or API fallback
                logger.warning(f"Speech recognition service request error: {e}")
                return {
                    "success": False,
                    "text": "",
                    "error": "Speech service temporarily unreachable from backend",
                    "latency_ms": int((time.time() - start_time) * 1000)
                }

            # Post-process with classroom science terminology enhancements
            enhanced_text = self._enhance_classroom_vocabulary(raw_text)
            latency_ms = int((time.time() - start_time) * 1000)

            return {
                "success": True,
                "text": enhanced_text,
                "raw_text": raw_text,
                "language": lang_code,
                "latency_ms": latency_ms
            }

        except Exception as e:
            logger.error(f"Audio processing error: {e}")
            return {
                "success": False,
                "text": "",
                "error": str(e),
                "latency_ms": int((time.time() - start_time) * 1000)
            }

    def _enhance_classroom_vocabulary(self, text: str) -> str:
        res = text
        for term, replacement in self.term_corrections.items():
            if term in res.lower():
                # Case-insensitive replacement
                import re
                res = re.sub(re.escape(term), replacement, res, flags=re.IGNORECASE)
        # Ensure capitalized first letter
        if res and len(res) > 0:
            res = res[0].upper() + res[1:]
        return res

speech_service = SpeechProcessingService()
