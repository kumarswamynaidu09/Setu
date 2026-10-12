import asyncio
import base64
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy.orm import Session
from app.models.database import get_db, SessionLocal
from app.models.models import LiveSession, CaptionSegment, User, UsageMetric
from app.schemas.schemas import CaptionSegmentCreate, CaptionCorrectionRequest, CaptionSegmentResponse
from app.routers.auth import get_current_teacher
from app.core.security import decode_access_token
from app.services.speech_service import speech_service
from app.services.stt_provider import get_stt_provider
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/speech", tags=["Live Speech & Captions"])

@router.post("/transcribe-chunk")
async def transcribe_chunk(
    session_id: str = Form(...),
    language: str = Form("en-IN"),
    segment_index: int = Form(0),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    session = db.query(LiveSession).filter(LiveSession.id == session_id, LiveSession.is_active == True).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active session not found")

    audio_bytes = await audio_file.read()
    result = speech_service.process_audio_chunk(audio_bytes, language=language)

    if result.get("success") and result.get("text"):
        text = result["text"]
        
        # Save caption segment to DB
        segment = CaptionSegment(
            session_id=session.id,
            segment_index=segment_index,
            text=text,
            original_text=text,
            is_corrected=False,
            timestamp_ms=int(time.time() * 1000),
            language=language
        )
        db.add(segment)
        db.commit()
        db.refresh(segment)

        # Broadcast new caption to all students
        await ws_manager.broadcast_to_room(session.id, {
            "type": "CAPTION_NEW",
            "caption": {
                "id": segment.id,
                "session_id": segment.session_id,
                "segment_index": segment.segment_index,
                "text": segment.text,
                "original_text": segment.original_text,
                "is_corrected": segment.is_corrected,
                "timestamp_ms": segment.timestamp_ms,
                "language": segment.language,
                "created_at": segment.created_at.isoformat()
            }
        })

        db.add(UsageMetric(event_type="caption_generated", session_id=session.id))
        db.commit()

        return {
            "success": True,
            "segment_id": segment.id,
            "text": text,
            "latency_ms": result.get("latency_ms", 0)
        }

    return {
        "success": result.get("success", False),
        "text": "",
        "latency_ms": result.get("latency_ms", 0),
        "error": result.get("error")
    }

@router.post("/captions/manual-stream")
async def post_manual_caption(
    caption_in: CaptionSegmentCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Allows posting client-recognized captions or real-time streaming segments directly"""
    session = db.query(LiveSession).filter(LiveSession.id == caption_in.session_id, LiveSession.teacher_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active session not found or unauthorized")

    # Calculate next sequential segment_index accurately from DB
    existing_count = db.query(CaptionSegment).filter(CaptionSegment.session_id == session.id).count()
    computed_index = existing_count + 1

    segment = CaptionSegment(
        session_id=session.id,
        segment_index=caption_in.segment_index if caption_in.segment_index and caption_in.segment_index > existing_count else computed_index,
        text=caption_in.text,
        original_text=caption_in.text,
        is_corrected=False,
        timestamp_ms=caption_in.timestamp_ms or int(time.time() * 1000),
        language=caption_in.language
    )
    db.add(segment)
    db.commit()
    db.refresh(segment)

    await ws_manager.broadcast_to_room(session.id, {
        "type": "CAPTION_NEW",
        "caption": {
            "id": segment.id,
            "session_id": segment.session_id,
            "segment_index": segment.segment_index,
            "text": segment.text,
            "original_text": segment.original_text,
            "is_corrected": segment.is_corrected,
            "timestamp_ms": segment.timestamp_ms,
            "language": segment.language,
            "created_at": segment.created_at.isoformat()
        }
    })

    db.add(UsageMetric(event_type="caption_generated", session_id=session.id))
    db.commit()

    return CaptionSegmentResponse.model_validate(segment)

@router.post("/captions/correct", response_model=CaptionSegmentResponse)
async def correct_caption_segment(
    correction: CaptionCorrectionRequest,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    segment = db.query(CaptionSegment).filter(CaptionSegment.id == correction.segment_id).first()
    if not segment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caption segment not found")

    session = db.query(LiveSession).filter(LiveSession.id == segment.session_id, LiveSession.teacher_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to correct this session")

    segment.text = correction.corrected_text
    segment.is_corrected = True
    db.commit()
    db.refresh(segment)

    # Broadcast correction to all connected students
    await ws_manager.broadcast_to_room(segment.session_id, {
        "type": "CAPTION_CORRECTED",
        "caption": {
            "id": segment.id,
            "session_id": segment.session_id,
            "segment_index": segment.segment_index,
            "text": segment.text,
            "original_text": segment.original_text,
            "is_corrected": True,
            "timestamp_ms": segment.timestamp_ms,
            "language": segment.language,
            "created_at": segment.created_at.isoformat()
        }
    })

    return segment

@router.get("/captions/{session_id}", response_model=List[CaptionSegmentResponse])
def get_captions(
    session_id: str,
    db: Session = Depends(get_db)
):
    captions = db.query(CaptionSegment).filter(CaptionSegment.session_id == session_id).order_by(CaptionSegment.segment_index.asc()).all()
    return captions

import json
import logging

logger = logging.getLogger("setu.speech")

# WebSocket live channel
@router.websocket("/live/{session_id}")
async def websocket_live_channel(
    websocket: WebSocket,
    session_id: str,
    role: str = "student",
    nickname: str = "Student",
    token: Optional[str] = None
):
    db = SessionLocal()
    try:
        session = db.query(LiveSession).filter(LiveSession.id == session_id).first()
        if not session or not session.is_active:
            await websocket.close(code=4004, reason="Live session not found or ended")
            return

        verified_role = "student"
        verified_nickname = nickname

        if token:
            payload = decode_access_token(token)
            if payload:
                token_role = payload.get("role")
                user_id = payload.get("sub")
                if token_role in ["teacher", "coordinator", "admin"]:
                    user = db.query(User).filter(User.id == user_id).first()
                    if user and (user.id == session.teacher_id or user.role in ["coordinator", "admin"]):
                        verified_role = "teacher"
                        verified_nickname = user.full_name
                elif token_role == "student":
                    verified_role = "student"
                    verified_nickname = payload.get("nickname", nickname)

        # Enforce role boundary: cannot claim teacher role without verified teacher identity
        if role == "teacher" and verified_role != "teacher":
            await websocket.close(code=4003, reason="Teacher privileges required")
            return

        await ws_manager.connect(websocket, session_id, role=verified_role, nickname=verified_nickname)
        
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")
            
            if event_type == "PING":
                await websocket.send_json({"type": "PONG"})
            elif event_type == "TEACHER_INTERIM":
                if verified_role == "teacher":
                    interim_text = data.get("text", "")
                    await ws_manager.broadcast_to_room(session_id, {
                        "type": "CAPTION_INTERIM",
                        "text": interim_text
                    })
            elif event_type == "STUDENT_PULSE":
                # Heartbeat
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        await ws_manager.broadcast_participant_count(session_id)
    except Exception:
        ws_manager.disconnect(websocket)
    finally:
        db.close()


@router.websocket("/stream")
async def websocket_speech_stream(
    websocket: WebSocket,
    session_id: Optional[str] = None,
    language: str = "en-IN",
    token: Optional[str] = None,
    provider: Optional[str] = None
):
    """
    Real-time streaming speech recognition endpoint.
    Accepts raw PCM audio bytes or base64 JSON chunks and produces
    CAPTION_PARTIAL and CAPTION_FINAL events.
    If session_id and verified teacher credentials are provided, finalized captions are
    persisted and broadcast to classroom participants in real time.
    """
    await websocket.accept()
    db = SessionLocal()
    is_teacher_session = False
    target_session = None

    if session_id and token:
        payload = decode_access_token(token)
        if payload and payload.get("role") in ["teacher", "coordinator", "admin"]:
            s = db.query(LiveSession).filter(LiveSession.id == session_id, LiveSession.is_active == True).first()
            if s and (s.teacher_id == payload.get("sub") or payload.get("role") in ["coordinator", "admin"]):
                is_teacher_session = True
                target_session = s

    audio_queue: asyncio.Queue = asyncio.Queue()
    stt = get_stt_provider(provider)

    async def incoming_task():
        try:
            while True:
                msg = await websocket.receive()
                if "bytes" in msg and msg["bytes"]:
                    await audio_queue.put(msg["bytes"])
                elif "text" in msg and msg["text"]:
                    try:
                        data = json.loads(msg["text"])
                        msg_type = data.get("type")
                        if msg_type == "PING":
                            await websocket.send_json({"type": "PONG"})
                        elif msg_type == "AUDIO_CHUNK":
                            raw = base64.b64decode(data.get("data", ""))
                            await audio_queue.put(raw)
                        elif msg_type == "CLOSE":
                            await audio_queue.put(None)
                            break
                    except Exception:
                        pass
        except WebSocketDisconnect:
            await audio_queue.put(None)
        except Exception:
            await audio_queue.put(None)

    async def outgoing_task():
        nonlocal is_teacher_session, target_session
        try:
            async for event in stt.process_stream(audio_queue, language=language):
                await websocket.send_json(event)
                
                # If connected to a live classroom session as teacher, broadcast to students
                if is_teacher_session and target_session:
                    if event.get("type") == "CAPTION_PARTIAL":
                        await ws_manager.broadcast_to_room(target_session.id, {
                            "type": "CAPTION_INTERIM",
                            "text": event.get("text", "")
                        })
                    elif event.get("type") == "CAPTION_FINAL":
                        text = event.get("text", "").strip()
                        if text:
                            existing_count = db.query(CaptionSegment).filter(CaptionSegment.session_id == target_session.id).count()
                            segment = CaptionSegment(
                                session_id=target_session.id,
                                segment_index=existing_count + 1,
                                text=text,
                                original_text=text,
                                is_corrected=False,
                                timestamp_ms=event.get("timestamp_ms", int(time.time() * 1000)),
                                language=language
                            )
                            db.add(segment)
                            db.commit()
                            db.refresh(segment)

                            await ws_manager.broadcast_to_room(target_session.id, {
                                "type": "CAPTION_NEW",
                                "caption": {
                                    "id": segment.id,
                                    "session_id": segment.session_id,
                                    "segment_index": segment.segment_index,
                                    "text": segment.text,
                                    "original_text": segment.original_text,
                                    "is_corrected": segment.is_corrected,
                                    "timestamp_ms": segment.timestamp_ms,
                                    "language": segment.language,
                                    "created_at": segment.created_at.isoformat()
                                }
                            })
                            db.add(UsageMetric(event_type="caption_generated", session_id=target_session.id))
                            db.commit()
        except Exception as e:
            logger.warning(f"Speech stream output error: {e}")

    in_coro = asyncio.create_task(incoming_task())
    out_coro = asyncio.create_task(outgoing_task())

    try:
        await asyncio.gather(in_coro, out_coro, return_exceptions=True)
    finally:
        db.close()

