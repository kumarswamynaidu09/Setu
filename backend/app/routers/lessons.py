from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import Lesson, LessonSection, ClassRoom, User
from app.schemas.schemas import LessonCreate, LessonUpdate, LessonResponse, LessonImportRequest
from app.routers.auth import get_current_teacher

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.get("", response_model=List[LessonResponse])
def list_lessons(
    class_id: Optional[str] = None,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    query = db.query(Lesson).join(ClassRoom).filter(ClassRoom.teacher_id == current_user.id)
    if class_id:
        query = query.filter(Lesson.class_id == class_id)
    return query.all()

@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(
    lesson_id: str,
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return lesson

@router.post("", response_model=LessonResponse)
def create_lesson(
    lesson_in: LessonCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    # Verify class belongs to teacher
    c = db.query(ClassRoom).filter(ClassRoom.id == lesson_in.class_id, ClassRoom.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classroom not found or unauthorized")

    new_lesson = Lesson(
        class_id=lesson_in.class_id,
        title=lesson_in.title,
        subject=lesson_in.subject,
        grade=lesson_in.grade,
        summary=lesson_in.summary,
        language=lesson_in.language
    )
    db.add(new_lesson)
    db.flush()

    for idx, sec in enumerate(lesson_in.sections):
        new_sec = LessonSection(
            lesson_id=new_lesson.id,
            order_index=sec.order_index if sec.order_index is not None else idx,
            title=sec.title,
            content_text=sec.content_text,
            simplified_text=sec.simplified_text or sec.content_text,
            key_terms=sec.key_terms,
            image_url=sec.image_url,
            image_alt=sec.image_alt,
            image_pedagogical_description=sec.image_pedagogical_description
        )
        db.add(new_sec)

    db.commit()
    db.refresh(new_lesson)
    return new_lesson

@router.put("/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    lesson_id: str,
    lesson_update: LessonUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).join(ClassRoom).filter(
        Lesson.id == lesson_id,
        ClassRoom.teacher_id == current_user.id
    ).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found or unauthorized")

    if lesson_update.title is not None:
        lesson.title = lesson_update.title
    if lesson_update.subject is not None:
        lesson.subject = lesson_update.subject
    if lesson_update.grade is not None:
        lesson.grade = lesson_update.grade
    if lesson_update.summary is not None:
        lesson.summary = lesson_update.summary
    if lesson_update.language is not None:
        lesson.language = lesson_update.language
    if lesson_update.is_published is not None:
        lesson.is_published = lesson_update.is_published

    if lesson_update.sections is not None:
        # Replace sections
        db.query(LessonSection).filter(LessonSection.lesson_id == lesson.id).delete()
        for idx, sec in enumerate(lesson_update.sections):
            new_sec = LessonSection(
                lesson_id=lesson.id,
                order_index=sec.order_index if sec.order_index is not None else idx,
                title=sec.title,
                content_text=sec.content_text,
                simplified_text=sec.simplified_text or sec.content_text,
                key_terms=sec.key_terms,
                image_url=sec.image_url,
                image_alt=sec.image_alt,
                image_pedagogical_description=sec.image_pedagogical_description
            )
            db.add(new_sec)

    db.commit()
    db.refresh(lesson)
    return lesson

@router.post("/import-text", response_model=LessonResponse)
def import_lesson_text(
    import_req: LessonImportRequest,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    c = db.query(ClassRoom).filter(ClassRoom.id == import_req.class_id, ClassRoom.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classroom not found or unauthorized")

    # Split text into paragraphs/sections intelligently
    raw_paragraphs = [p.strip() for p in import_req.raw_text.split("\n\n") if p.strip()]
    if not raw_paragraphs:
        raw_paragraphs = [import_req.raw_text.strip()]

    new_lesson = Lesson(
        class_id=import_req.class_id,
        title=import_req.title,
        subject=import_req.subject,
        grade=import_req.grade,
        summary=raw_paragraphs[0][:150] + "..." if len(raw_paragraphs[0]) > 150 else raw_paragraphs[0],
        language=import_req.language
    )
    db.add(new_lesson)
    db.flush()

    for idx, para in enumerate(raw_paragraphs):
        # Extract title if starts with # or first sentence
        lines = para.split("\n")
        title = f"Section {idx + 1}"
        content = para
        if lines[0].startswith("#"):
            title = lines[0].replace("#", "").strip()
            content = "\n".join(lines[1:]).strip() or title
        elif len(lines[0]) < 60 and len(lines) > 1:
            title = lines[0].strip()
            content = "\n".join(lines[1:]).strip()

        new_sec = LessonSection(
            lesson_id=new_lesson.id,
            order_index=idx,
            title=title,
            content_text=content,
            simplified_text=content, # Teacher can review and edit
            key_terms="",
            image_url=None,
            image_alt=None,
            image_pedagogical_description=None
        )
        db.add(new_sec)

    db.commit()
    db.refresh(new_lesson)
    return new_lesson

@router.delete("/{lesson_id}")
def delete_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).join(ClassRoom).filter(
        Lesson.id == lesson_id,
        ClassRoom.teacher_id == current_user.id
    ).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found or unauthorized")
    db.delete(lesson)
    db.commit()
    return {"message": "Lesson deleted successfully"}
