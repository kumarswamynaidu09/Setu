import random
import string
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import LiveSession, ClassRoom, Lesson, User, CaptionSegment, Announcement, StudentQuestion, UsageMetric
from app.schemas.schemas import (
    SessionCreate, SessionJoinRequest, SessionJoinResponse,
    SessionSyncUpdate, SessionResponse, CaptionSegmentResponse,
    AnnouncementResponse, QuestionResponse, LessonResponse
)
from app.routers.auth import get_current_teacher
from app.services.websocket_manager import ws_manager
from app.core.security import create_access_token

router = APIRouter(prefix="/sessions", tags=["Live Sessions"])

def generate_room_code(db: Session) -> str:
    """Generate a clean, readable 6-character room code (e.g. SETU89)"""
    for _ in range(10):
        digits = "".join(random.choices(string.digits, k=2))
        suffix = "".join(random.choices(string.ascii_uppercase, k=2))
        code = f"SETU{digits}{suffix}"
        existing = db.query(LiveSession).filter(LiveSession.room_code == code, LiveSession.is_active == True).first()
        if not existing:
            return code
    return f"SETU{random.randint(1000, 9999)}"

@router.post("/start", response_model=SessionResponse)
async def start_session(
    session_in: SessionCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    c = db.query(ClassRoom).filter(ClassRoom.id == session_in.class_id, ClassRoom.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classroom not found")

    # Deactivate existing active sessions for this class to maintain single live session integrity
    active_prev = db.query(LiveSession).filter(LiveSession.class_id == c.id, LiveSession.is_active == True).all()
    for s in active_prev:
        s.is_active = False
        s.ended_at = datetime.now(timezone.utc)
        await ws_manager.broadcast_to_room(s.id, {"type": "SESSION_ENDED"})

    room_code = generate_room_code(db)
    new_session = LiveSession(
        room_code=room_code,
        class_id=c.id,
        lesson_id=session_in.lesson_id,
        teacher_id=current_user.id,
        is_active=True,
        current_section_index=0,
        started_at=datetime.now(timezone.utc)
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Log metric
    db.add(UsageMetric(event_type="session_started", session_id=new_session.id))
    db.commit()

    return new_session

@router.post("/join", response_model=SessionJoinResponse)
async def join_session(
    join_in: SessionJoinRequest,
    db: Session = Depends(get_db)
):
    code = join_in.room_code.strip().upper()
    session = db.query(LiveSession).filter(LiveSession.room_code == code, LiveSession.is_active == True).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active session not found for this room code. Please check the code or ask your teacher."
        )

    classroom = session.classroom
    teacher = session.teacher
    lesson = session.lesson

    # Anonymous temporary token for student session participation
    student_token = create_access_token(data={
        "sub": f"student_{session.id}_{random.randint(1000, 9999)}",
        "role": "student",
        "session_id": session.id,
        "nickname": join_in.student_nickname or "Student"
    })

    # Log metric
    db.add(UsageMetric(event_type="student_joined", session_id=session.id))
    db.commit()

    return SessionJoinResponse(
        session_id=session.id,
        room_code=session.room_code,
        class_id=classroom.id,
        class_name=classroom.name,
        grade=classroom.grade,
        subject=classroom.subject,
        teacher_name=teacher.full_name,
        lesson=LessonResponse.model_validate(lesson) if lesson else None,
        current_section_index=session.current_section_index,
        student_token=student_token,
        is_active=session.is_active
    )

@router.get("/active/{session_id}")
def get_session_details(
    session_id: str,
    db: Session = Depends(get_db)
):
    session = db.query(LiveSession).filter(LiveSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    
    captions = db.query(CaptionSegment).filter(CaptionSegment.session_id == session.id).order_by(CaptionSegment.segment_index.asc()).all()
    announcements = db.query(Announcement).filter(Announcement.session_id == session.id).order_by(Announcement.created_at.desc()).all()
    questions = db.query(StudentQuestion).filter(StudentQuestion.session_id == session.id).order_by(StudentQuestion.created_at.desc()).all()

    return {
        "session": SessionResponse.model_validate(session),
        "captions": [CaptionSegmentResponse.model_validate(c) for c in captions],
        "announcements": [AnnouncementResponse.model_validate(a) for a in announcements],
        "questions": [QuestionResponse.model_validate(q) for q in questions],
        "connected_count": ws_manager.get_room_count(session_id)
    }

@router.post("/{session_id}/sync-section")
async def sync_lesson_section(
    session_id: str,
    sync_in: SessionSyncUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    session = db.query(LiveSession).filter(LiveSession.id == session_id, LiveSession.teacher_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or unauthorized")
    
    session.current_section_index = sync_in.current_section_index
    db.commit()

    # Broadcast section change to all student clients in the room
    await ws_manager.broadcast_to_room(session_id, {
        "type": "SECTION_CHANGED",
        "current_section_index": sync_in.current_section_index
    })

    return {"message": "Section synced successfully", "current_section_index": session.current_section_index}

@router.post("/{session_id}/end")
async def end_session(
    session_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    session = db.query(LiveSession).filter(LiveSession.id == session_id, LiveSession.teacher_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or unauthorized")

    session.is_active = False
    session.ended_at = datetime.now(timezone.utc)
    db.commit()

    # Broadcast session ended event
    await ws_manager.broadcast_to_room(session_id, {
        "type": "SESSION_ENDED"
    })

    return {"message": "Session ended successfully"}

@router.get("/history", response_model=List[SessionResponse])
def get_session_history(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    sessions = db.query(LiveSession).filter(LiveSession.teacher_id == current_user.id).order_by(LiveSession.started_at.desc()).limit(20).all()
    return sessions
