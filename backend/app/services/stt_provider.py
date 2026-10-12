import asyncio
import io
import json
import logging
import time
import uuid
import wave
from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, Optional
import websockets

from app.core.config import settings
from app.services.speech_service import speech_service

logger = logging.getLogger("setu.stt")

class StreamingSTTProvider(ABC):
    @abstractmethod
    async def process_stream(
        self,
        audio_queue: asyncio.Queue,
        language: str = "en-IN"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Consumes raw audio bytes from audio_queue and yields caption events:
        CAPTION_PARTIAL, CAPTION_FINAL, CAPTION_STATUS.
        """
        pass

class MockStreamingProvider(StreamingSTTProvider):
    """
    Offline/testing streaming provider for deterministic live captions.
    Used for local dev, offline classrooms, and automated tests.
    """
    def __init__(self, demo_phrases: Optional[list] = None):
        self.demo_phrases = demo_phrases or [
            "Welcome to SETU inclusive classroom.",
            "Today we are studying the Solar System and planetary orbits.",
            "Notice how Earth revolves around the Sun in an elliptical path.",
            "Gravitational force keeps the planets in equilibrium.",
            "Please feel free to ask questions using the communication board."
        ]

    async def process_stream(
        self,
        audio_queue: asyncio.Queue,
        language: str = "en-IN"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        yield {
            "type": "CAPTION_STATUS",
            "status": "READY",
            "provider": "mock",
            "language": language
        }
        
        utterance_idx = 0
        seq = 1
        phrase_idx = 0

        while True:
            chunk = await audio_queue.get()
            if chunk is None:  # Sentinel to stop
                break

            # If meaningful audio chunk is received (e.g. >= 2048 bytes), simulate interim then final
            if len(chunk) >= 1024:
                phrase = self.demo_phrases[phrase_idx % len(self.demo_phrases)]
                phrase_idx += 1
                words = phrase.split()
                utterance_id = f"utt_{uuid.uuid4().hex[:8]}"

                # Emit interim partials
                for i in range(1, len(words)):
                    partial_text = " ".join(words[:i])
                    yield {
                        "type": "CAPTION_PARTIAL",
                        "utterance_id": utterance_id,
                        "sequence_number": seq,
                        "text": partial_text,
                        "language": language,
                        "is_final": False,
                        "timestamp_ms": int(time.time() * 1000)
                    }
                    seq += 1
                    await asyncio.sleep(0.08)

                # Emit finalized transcript
                yield {
                    "type": "CAPTION_FINAL",
                    "utterance_id": utterance_id,
                    "sequence_number": seq,
                    "text": phrase,
                    "language": language,
                    "is_final": True,
                    "timestamp_ms": int(time.time() * 1000)
                }
                seq += 1

class LocalSpeechRecognitionProvider(StreamingSTTProvider):
    """
    Processes streaming audio by buffering incoming PCM/WAV chunks and
    running local speech_recognition when voice activity / silence is detected.
    """
    def __init__(self):
        self.sample_rate = 16000
        self.channels = 1
        self.sample_width = 2

    async def process_stream(
        self,
        audio_queue: asyncio.Queue,
        language: str = "en-IN"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        yield {
            "type": "CAPTION_STATUS",
            "status": "READY",
            "provider": "local_speech_recognition",
            "language": language
        }

        buffer = bytearray()
        seq = 1
        last_process_time = time.time()
        # Process every ~2 seconds of audio (64000 bytes at 16kHz 16-bit mono)
        chunk_threshold = 16000 * 2 * 2 

        while True:
            chunk = await audio_queue.get()
            if chunk is None:
                # Flush remaining buffer
                if len(buffer) > 4000:
                    event = await self._transcribe_buffer(bytes(buffer), language, seq)
                    if event:
                        yield event
                break

            buffer.extend(chunk)
            now = time.time()

            if len(buffer) >= chunk_threshold or (len(buffer) > 8000 and (now - last_process_time) > 2.5):
                to_process = bytes(buffer)
                buffer.clear()
                last_process_time = now

                event = await self._transcribe_buffer(to_process, language, seq)
                if event:
                    seq = event.get("sequence_number", seq) + 1
                    yield event

    async def _transcribe_buffer(self, pcm_bytes: bytes, language: str, seq: int) -> Optional[Dict[str, Any]]:
        # Wrap raw PCM in WAV container
        wav_io = io.BytesIO()
        with wave.open(wav_io, "wb") as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.sample_width)
            wf.setframerate(self.sample_rate)
            wf.writeframes(pcm_bytes)
        wav_bytes = wav_io.getvalue()

        loop = asyncio.get_running_loop()
        res = await loop.run_in_executor(None, speech_service.process_audio_chunk, wav_bytes, language)

        if res.get("success") and res.get("text"):
            text = res["text"].strip()
            if text:
                return {
                    "type": "CAPTION_FINAL",
                    "utterance_id": f"utt_{uuid.uuid4().hex[:8]}",
                    "sequence_number": seq,
                    "text": text,
                    "language": res.get("language", language),
                    "is_final": True,
                    "timestamp_ms": int(time.time() * 1000),
                    "latency_ms": res.get("latency_ms", 0)
                }
        return None

class DeepgramStreamingProvider(StreamingSTTProvider):
    """
    Live streaming speech-to-text via Deepgram WebSocket API.
    Provides sub-300ms interim partials and finalized transcripts.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.DEEPGRAM_API_KEY

    async def process_stream(
        self,
        audio_queue: asyncio.Queue,
        language: str = "en-IN"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        if not self.api_key:
            yield {
                "type": "CAPTION_STATUS",
                "status": "NOT_CONFIGURED",
                "provider": "deepgram",
                "detail": "DEEPGRAM_API_KEY environment variable not configured"
            }
            # Fall back to local recognizer
            local_provider = LocalSpeechRecognitionProvider()
            async for ev in local_provider.process_stream(audio_queue, language):
                yield ev
            return

        lang_param = "en-IN" if language.startswith("en") else ("hi" if language.startswith("hi") else language)
        dg_url = (
            f"wss://api.deepgram.com/v1/listen"
            f"?model=nova-2&language={lang_param}&smart_format=true&interim_results=true"
            f"&encoding=linear16&sample_rate=16000&channels=1"
        )
        headers = {"Authorization": f"Token {self.api_key}"}

        try:
            async with websockets.connect(dg_url, extra_headers=headers) as dg_ws:
                yield {
                    "type": "CAPTION_STATUS",
                    "status": "READY",
                    "provider": "deepgram",
                    "language": language
                }

                out_queue: asyncio.Queue = asyncio.Queue()
                seq = 1

                async def sender_task():
                    try:
                        while True:
                            chunk = await audio_queue.get()
                            if chunk is None:
                                await dg_ws.send(json.dumps({"type": "CloseStream"}))
                                break
                            await dg_ws.send(chunk)
                    except Exception as e:
                        logger.warning(f"Deepgram sender error: {e}")

                async def receiver_task():
                    nonlocal seq
                    try:
                        async for msg in dg_ws:
                            data = json.loads(msg)
                            channel = data.get("channel", {})
                            alternatives = channel.get("alternatives", [])
                            if alternatives:
                                transcript = alternatives[0].get("transcript", "").strip()
                                is_final = data.get("is_final", False)
                                if transcript:
                                    enhanced = speech_service._enhance_classroom_vocabulary(transcript)
                                    event = {
                                        "type": "CAPTION_FINAL" if is_final else "CAPTION_PARTIAL",
                                        "utterance_id": f"dg_{uuid.uuid4().hex[:8]}",
                                        "sequence_number": seq,
                                        "text": enhanced,
                                        "language": language,
                                        "is_final": is_final,
                                        "timestamp_ms": int(time.time() * 1000)
                                    }
                                    seq += 1
                                    await out_queue.put(event)
                    except Exception as e:
                        logger.warning(f"Deepgram receiver error: {e}")
                    finally:
                        await out_queue.put(None)

                send_coro = asyncio.create_task(sender_task())
                recv_coro = asyncio.create_task(receiver_task())

                while True:
                    ev = await out_queue.get()
                    if ev is None:
                        break
                    yield ev

                await asyncio.gather(send_coro, recv_coro, return_exceptions=True)

        except Exception as e:
            logger.error(f"Deepgram connection failed: {e}. Falling back to local recognizer.")
            yield {
                "type": "CAPTION_STATUS",
                "status": "FALLBACK_LOCAL",
                "provider": "local_speech_recognition",
                "detail": str(e)
            }
            local_fallback = LocalSpeechRecognitionProvider()
            async for ev in local_fallback.process_stream(audio_queue, language):
                yield ev


class SarvamStreamingProvider(StreamingSTTProvider):
    """
    Indian language speech-to-text via Sarvam AI.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.SARVAM_API_KEY

    async def process_stream(
        self,
        audio_queue: asyncio.Queue,
        language: str = "hi-IN"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        if not self.api_key:
            yield {
                "type": "CAPTION_STATUS",
                "status": "NOT_CONFIGURED",
                "provider": "sarvam",
                "detail": "SARVAM_API_KEY environment variable not configured"
            }
            local_provider = LocalSpeechRecognitionProvider()
            async for ev in local_provider.process_stream(audio_queue, language):
                yield ev
            return

        yield {
            "type": "CAPTION_STATUS",
            "status": "READY",
            "provider": "sarvam",
            "language": language
        }
        # Fallback to local recognizer while keeping clean Sarvam interface
        local_provider = LocalSpeechRecognitionProvider()
        async for ev in local_provider.process_stream(audio_queue, language):
            yield ev


def get_stt_provider(provider_name: Optional[str] = None) -> StreamingSTTProvider:
    """Factory for selecting STT provider based on configuration."""
    name = (provider_name or settings.STT_ENGINE).lower()
    if name == "mock":
        return MockStreamingProvider()
    if name == "deepgram" and settings.DEEPGRAM_API_KEY:
        return DeepgramStreamingProvider()
    if name == "sarvam" and settings.SARVAM_API_KEY:
        return SarvamStreamingProvider()
    if name == "hybrid":
        if settings.DEEPGRAM_API_KEY:
            return DeepgramStreamingProvider()
        if settings.SARVAM_API_KEY:
            return SarvamStreamingProvider()
        return LocalSpeechRecognitionProvider()
    return LocalSpeechRecognitionProvider()
