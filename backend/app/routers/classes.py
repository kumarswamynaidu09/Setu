from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import ClassRoom, User, Lesson
from app.schemas.schemas import ClassCreate, ClassUpdate, ClassResponse
from app.routers.auth import get_current_teacher

router = APIRouter(prefix="/classes", tags=["Classrooms"])

@router.get("", response_model=List[ClassResponse])
def list_classes(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    classes = db.query(ClassRoom).filter(ClassRoom.teacher_id == current_user.id).all()
    results = []
    for c in classes:
        count = db.query(Lesson).filter(Lesson.class_id == c.id).count()
        results.append(ClassResponse(
            id=c.id,
            name=c.name,
            grade=c.grade,
            subject=c.subject,
            section=c.section,
            teacher_id=c.teacher_id,
            created_at=c.created_at,
            lesson_count=count
        ))
    return results

@router.post("", response_model=ClassResponse)
def create_class(
    class_in: ClassCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    new_class = ClassRoom(
        name=class_in.name,
        grade=class_in.grade,
        subject=class_in.subject,
        section=class_in.section or "A",
        teacher_id=current_user.id
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return ClassResponse(
        id=new_class.id,
        name=new_class.name,
        grade=new_class.grade,
        subject=new_class.subject,
        section=new_class.section,
        teacher_id=new_class.teacher_id,
        created_at=new_class.created_at,
        lesson_count=0
    )

@router.get("/{class_id}", response_model=ClassResponse)
def get_class(
    class_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    c = db.query(ClassRoom).filter(ClassRoom.id == class_id, ClassRoom.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    count = db.query(Lesson).filter(Lesson.class_id == c.id).count()
    return ClassResponse(
        id=c.id,
        name=c.name,
        grade=c.grade,
        subject=c.subject,
        section=c.section,
        teacher_id=c.teacher_id,
        created_at=c.created_at,
        lesson_count=count
    )

@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: str,
    class_update: ClassUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    c = db.query(ClassRoom).filter(ClassRoom.id == class_id, ClassRoom.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    
    if class_update.name is not None:
        c.name = class_update.name
    if class_update.grade is not None:
        c.grade = class_update.grade
    if class_update.subject is not None:
        c.subject = class_update.subject
    if class_update.section is not None:
        c.section = class_update.section

    db.commit()
    db.refresh(c)
    count = db.query(Lesson).filter(Lesson.class_id == c.id).count()
    return ClassResponse(
        id=c.id,
        name=c.name,
        grade=c.grade,
        subject=c.subject,
        section=c.section,
        teacher_id=c.teacher_id,
        created_at=c.created_at,
        lesson_count=count
    )

@router.delete("/{class_id}")
def delete_class(
    class_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    c = db.query(ClassRoom).filter(ClassRoom.id == class_id, ClassRoom.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    db.delete(c)
    db.commit()
    return {"message": "Class deleted successfully"}
