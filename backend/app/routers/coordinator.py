from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import School, User, ClassRoom, Lesson, LiveSession, StudentQuestion, CaptionSegment, UsageMetric
from app.schemas.schemas import CoordinatorMetricsResponse, UserProfile, SchoolResponse
from app.routers.auth import get_current_coordinator

router = APIRouter(prefix="/coordinator", tags=["Coordinator Portal"])

@router.get("/metrics", response_model=CoordinatorMetricsResponse)
def get_coordinator_metrics(
    current_user: User = Depends(get_current_coordinator),
    db: Session = Depends(get_db)
):
    school = db.query(School).filter(School.id == current_user.school_id).first()
    school_name = school.name if school else "Government Model Senior Secondary School"
    district = school.district if school else "Rangareddy"
    state = school.state if school else "Telangana"

    total_teachers = db.query(User).filter(User.role == "teacher").count()
    total_classes = db.query(ClassRoom).count()
    total_lessons = db.query(Lesson).count()
    total_live_sessions = db.query(LiveSession).count()
    active_sessions_now = db.query(LiveSession).filter(LiveSession.is_active == True).count()
    total_questions = db.query(StudentQuestion).count()
    total_captions = db.query(CaptionSegment).count()

    return CoordinatorMetricsResponse(
        total_teachers=total_teachers,
        total_classes=total_classes,
        total_lessons=total_lessons,
        total_live_sessions=total_live_sessions,
        active_sessions_now=active_sessions_now,
        total_questions_handled=total_questions,
        total_captions_generated=total_captions,
        sample_school_name=school_name,
        district=district,
        state=state
    )

@router.get("/teachers", response_model=List[UserProfile])
def list_school_teachers(
    current_user: User = Depends(get_current_coordinator),
    db: Session = Depends(get_db)
):
    teachers = db.query(User).filter(User.role == "teacher").all()
    return teachers

@router.get("/school", response_model=SchoolResponse)
def get_school_info(
    current_user: User = Depends(get_current_coordinator),
    db: Session = Depends(get_db)
):
    school = db.query(School).filter(School.id == current_user.school_id).first()
    if not school:
        school = db.query(School).first()
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School profile not configured")
    return school
