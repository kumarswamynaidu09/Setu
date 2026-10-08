from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import StudentQuestion, LiveSession, User, UsageMetric
from app.schemas.schemas import QuestionCreate, QuestionAcknowledgeRequest, QuestionAnswerRequest, QuestionResponse
from app.routers.auth import get_current_teacher
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/questions", tags=["Student AAC & Questions"])

@router.post("", response_model=QuestionResponse)
async def submit_question(
    q_in: QuestionCreate,
    db: Session = Depends(get_db)
):
    session = db.query(LiveSession).filter(LiveSession.id == q_in.session_id, LiveSession.is_active == True).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active session not found")

    new_q = StudentQuestion(
        session_id=session.id,
        student_nickname=q_in.student_nickname or "Student",
        message_type=q_in.message_type or "aac_phrase",
        content=q_in.content,
        status="pending"
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)

    # Broadcast question event to teacher
    await ws_manager.broadcast_to_room(session.id, {
        "type": "QUESTION_NEW",
        "question": {
            "id": new_q.id,
            "session_id": new_q.session_id,
            "student_nickname": new_q.student_nickname,
            "message_type": new_q.message_type,
            "content": new_q.content,
            "status": new_q.status,
            "created_at": new_q.created_at.isoformat()
        }
    })

    # Log metric
    db.add(UsageMetric(event_type="aac_question_submitted", session_id=session.id))
    db.commit()

    return new_q

@router.post("/acknowledge", response_model=QuestionResponse)
async def acknowledge_question(
    ack_in: QuestionAcknowledgeRequest,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    q = db.query(StudentQuestion).filter(StudentQuestion.id == ack_in.question_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    q.status = "acknowledged"
    db.commit()
    db.refresh(q)

    # Broadcast acknowledgement to the room
    await ws_manager.broadcast_to_room(q.session_id, {
        "type": "QUESTION_ACKNOWLEDGED",
        "question_id": q.id,
        "status": "acknowledged",
        "content": q.content,
        "student_nickname": q.student_nickname
    })

    return q

@router.post("/answer", response_model=QuestionResponse)
async def answer_question(
    ans_in: QuestionAnswerRequest,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    q = db.query(StudentQuestion).filter(StudentQuestion.id == ans_in.question_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    q.status = "answered"
    q.response_text = ans_in.response_text
    db.commit()
    db.refresh(q)

    # Broadcast answer to the room
    await ws_manager.broadcast_to_room(q.session_id, {
        "type": "QUESTION_ANSWERED",
        "question_id": q.id,
        "status": "answered",
        "response_text": q.response_text,
        "content": q.content
    })

    return q

@router.get("/session/{session_id}", response_model=List[QuestionResponse])
def get_session_questions(
    session_id: str,
    db: Session = Depends(get_db)
):
    questions = db.query(StudentQuestion).filter(StudentQuestion.session_id == session_id).order_by(StudentQuestion.created_at.desc()).all()
    return questions
