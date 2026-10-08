from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import Announcement, LiveSession, User, UsageMetric
from app.schemas.schemas import AnnouncementCreate, AnnouncementResponse
from app.routers.auth import get_current_teacher
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.post("", response_model=AnnouncementResponse)
async def publish_announcement(
    ann_in: AnnouncementCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    session = db.query(LiveSession).filter(LiveSession.id == ann_in.session_id, LiveSession.teacher_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or unauthorized")

    new_ann = Announcement(
        session_id=session.id,
        category=ann_in.category or "General",
        title=ann_in.title,
        content=ann_in.content,
        priority=ann_in.priority or "normal"
    )
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)

    # Broadcast to room
    await ws_manager.broadcast_to_room(session.id, {
        "type": "ANNOUNCEMENT_NEW",
        "announcement": {
            "id": new_ann.id,
            "session_id": new_ann.session_id,
            "category": new_ann.category,
            "title": new_ann.title,
            "content": new_ann.content,
            "priority": new_ann.priority,
            "created_at": new_ann.created_at.isoformat()
        }
    })

    # Log metric
    db.add(UsageMetric(event_type="announcement_published", session_id=session.id))
    db.commit()

    return new_ann

@router.get("/session/{session_id}", response_model=List[AnnouncementResponse])
def get_session_announcements(
    session_id: str,
    db: Session = Depends(get_db)
):
    announcements = db.query(Announcement).filter(Announcement.session_id == session_id).order_by(Announcement.created_at.desc()).all()
    return announcements
