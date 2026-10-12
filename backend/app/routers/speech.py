import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from app.models.database import get_db, SessionLocal
from app.models.models import LiveSession, CaptionSegment, User, UsageMetric
from app.schemas.schemas import CaptionSegmentCreate, CaptionCorrectionRequest, CaptionSegmentResponse
from app.routers.auth import get_current_teacher
from app.services.speech_service import speech_service
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

# WebSocket live channel
@router.websocket("/live/{session_id}")
async def websocket_live_channel(websocket: WebSocket, session_id: str, role: str = "student", nickname: str = "Student"):
    await ws_manager.connect(websocket, session_id, role=role, nickname=nickname)
    db = SessionLocal()
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")
            
            if event_type == "PING":
                await websocket.send_json({"type": "PONG"})
            elif event_type == "TEACHER_INTERIM":
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
