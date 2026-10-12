import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class School(Base):
    __tablename__ = "schools"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="school")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="teacher", nullable=False) # teacher, coordinator, admin
    school_id = Column(String(36), ForeignKey("schools.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    school = relationship("School", back_populates="users")
    classes = relationship("ClassRoom", back_populates="teacher")
    sessions = relationship("LiveSession", back_populates="teacher")
    disability_profiles = relationship("DisabilityProfile", back_populates="user", cascade="all, delete-orphan")


class DisabilityProfile(Base):
    __tablename__ = "disability_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    disability_type = Column(String(50), nullable=False)  # hearing, vision, motor, cognitive, speech, none
    severity = Column(String(20), default="moderate")  # mild, moderate, severe
    preferences_json = Column(Text, nullable=True)  # JSON string of specific preferences
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="disability_profiles")


class ClassRoom(Base):
    __tablename__ = "classes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    grade = Column(String(50), nullable=False) # e.g. "Class 6"
    subject = Column(String(100), nullable=False) # e.g. "General Science"
    section = Column(String(50), nullable=True, default="A")
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    teacher = relationship("User", back_populates="classes")
    lessons = relationship("Lesson", back_populates="classroom", cascade="all, delete-orphan")
    sessions = relationship("LiveSession", back_populates="classroom")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    class_id = Column(String(36), ForeignKey("classes.id"), nullable=False)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)
    grade = Column(String(50), nullable=False)
    summary = Column(Text, nullable=True)
    language = Column(String(10), default="en") # en, hi, te
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    classroom = relationship("ClassRoom", back_populates="lessons")
    sections = relationship("LessonSection", back_populates="lesson", order_by="LessonSection.order_index", cascade="all, delete-orphan")
    sessions = relationship("LiveSession", back_populates="lesson")


class LessonSection(Base):
    __tablename__ = "lesson_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lesson_id = Column(String(36), ForeignKey("lessons.id"), nullable=False)
    order_index = Column(Integer, default=0)
    title = Column(String(255), nullable=False)
    content_text = Column(Text, nullable=False)
    simplified_text = Column(Text, nullable=True)
    key_terms = Column(Text, nullable=True) # JSON or comma-separated terms
    image_url = Column(String(500), nullable=True)
    image_alt = Column(String(500), nullable=True)
    image_pedagogical_description = Column(Text, nullable=True) # Audio description for visually impaired students

    lesson = relationship("Lesson", back_populates="sections")


class LiveSession(Base):
    __tablename__ = "live_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_code = Column(String(10), unique=True, index=True, nullable=False) # e.g. "SETU89"
    class_id = Column(String(36), ForeignKey("classes.id"), nullable=False)
    lesson_id = Column(String(36), ForeignKey("lessons.id"), nullable=True)
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    current_section_index = Column(Integer, default=0)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime, nullable=True)
    participant_count = Column(Integer, default=0)

    classroom = relationship("ClassRoom", back_populates="sessions")
    lesson = relationship("Lesson", back_populates="sessions")
    teacher = relationship("User", back_populates="sessions")
    captions = relationship("CaptionSegment", back_populates="session", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="session", cascade="all, delete-orphan")
    questions = relationship("StudentQuestion", back_populates="session", cascade="all, delete-orphan")


class CaptionSegment(Base):
    __tablename__ = "caption_segments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("live_sessions.id"), nullable=False)
    segment_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    original_text = Column(Text, nullable=True)
    is_corrected = Column(Boolean, default=False)
    timestamp_ms = Column(Integer, default=0)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("LiveSession", back_populates="captions")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("live_sessions.id"), nullable=False)
    category = Column(String(50), default="General") # Assignment, Exam, Timetable, Safety, General
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(20), default="normal") # normal, urgent
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("LiveSession", back_populates="announcements")


class StudentQuestion(Base):
    __tablename__ = "student_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("live_sessions.id"), nullable=False)
    student_nickname = Column(String(100), default="Student")
    message_type = Column(String(50), default="aac_phrase") # aac_phrase, custom_text, clarification
    content = Column(Text, nullable=False)
    status = Column(String(50), default="pending") # pending, acknowledged, answered
    response_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("LiveSession", back_populates="questions")


class UsageMetric(Base):
    __tablename__ = "usage_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_type = Column(String(100), nullable=False) # session_started, student_joined, caption_generated, aac_submitted, lesson_read, etc.
    session_id = Column(String(36), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
