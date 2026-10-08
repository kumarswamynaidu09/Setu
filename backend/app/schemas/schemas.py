from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: str = Field(default="teacher") # teacher, coordinator
    school_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str
    school_id: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    school_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- School Schemas ---
class SchoolCreate(BaseModel):
    name: str
    code: str
    district: Optional[str] = None
    state: Optional[str] = None

class SchoolResponse(BaseModel):
    id: str
    name: str
    code: str
    district: Optional[str] = None
    state: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- ClassRoom Schemas ---
class ClassCreate(BaseModel):
    name: str
    grade: str
    subject: str
    section: Optional[str] = "A"

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    subject: Optional[str] = None
    section: Optional[str] = None

class ClassResponse(BaseModel):
    id: str
    name: str
    grade: str
    subject: str
    section: Optional[str] = None
    teacher_id: str
    created_at: datetime
    lesson_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

# --- Lesson & Section Schemas ---
class LessonSectionCreate(BaseModel):
    order_index: int = 0
    title: str
    content_text: str
    simplified_text: Optional[str] = None
    key_terms: Optional[str] = None
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    image_pedagogical_description: Optional[str] = None

class LessonSectionResponse(BaseModel):
    id: str
    lesson_id: str
    order_index: int
    title: str
    content_text: str
    simplified_text: Optional[str] = None
    key_terms: Optional[str] = None
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    image_pedagogical_description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class LessonCreate(BaseModel):
    class_id: str
    title: str
    subject: str
    grade: str
    summary: Optional[str] = None
    language: str = "en"
    sections: List[LessonSectionCreate] = []

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[str] = None
    summary: Optional[str] = None
    language: Optional[str] = None
    is_published: Optional[bool] = None
    sections: Optional[List[LessonSectionCreate]] = None

class LessonResponse(BaseModel):
    id: str
    class_id: str
    title: str
    subject: str
    grade: str
    summary: Optional[str] = None
    language: str
    is_published: bool
    created_at: datetime
    sections: List[LessonSectionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class LessonImportRequest(BaseModel):
    class_id: str
    title: str
    subject: str
    grade: str
    raw_text: str
    language: str = "en"

# --- Live Session Schemas ---
class SessionCreate(BaseModel):
    class_id: str
    lesson_id: Optional[str] = None

class SessionJoinRequest(BaseModel):
    room_code: str
    student_nickname: Optional[str] = "Student"

class SessionJoinResponse(BaseModel):
    session_id: str
    room_code: str
    class_id: str
    class_name: str
    grade: str
    subject: str
    teacher_name: str
    lesson: Optional[LessonResponse] = None
    current_section_index: int = 0
    student_token: str
    is_active: bool

class SessionSyncUpdate(BaseModel):
    current_section_index: int

class SessionResponse(BaseModel):
    id: str
    room_code: str
    class_id: str
    lesson_id: Optional[str] = None
    teacher_id: str
    is_active: bool
    current_section_index: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    participant_count: int
    lesson: Optional[LessonResponse] = None

    model_config = ConfigDict(from_attributes=True)

# --- Captions & Speech Schemas ---
class CaptionSegmentCreate(BaseModel):
    session_id: str
    segment_index: int
    text: str
    timestamp_ms: int = 0
    language: str = "en"

class CaptionCorrectionRequest(BaseModel):
    segment_id: str
    corrected_text: str

class CaptionSegmentResponse(BaseModel):
    id: str
    session_id: str
    segment_index: int
    text: str
    original_text: Optional[str] = None
    is_corrected: bool
    timestamp_ms: int
    language: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Announcements ---
class AnnouncementCreate(BaseModel):
    session_id: str
    category: str = "General" # Assignment, Exam, Timetable, Safety, General
    title: str
    content: str
    priority: str = "normal"

class AnnouncementResponse(BaseModel):
    id: str
    session_id: str
    category: str
    title: str
    content: str
    priority: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Student Questions & AAC Responses ---
class QuestionCreate(BaseModel):
    session_id: str
    student_nickname: Optional[str] = "Student"
    message_type: str = "aac_phrase" # aac_phrase, custom_text, clarification
    content: str

class QuestionAcknowledgeRequest(BaseModel):
    question_id: str

class QuestionAnswerRequest(BaseModel):
    question_id: str
    response_text: str

class QuestionResponse(BaseModel):
    id: str
    session_id: str
    student_nickname: str
    message_type: str
    content: str
    status: str
    response_text: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Coordinator & Analytics ---
class CoordinatorMetricsResponse(BaseModel):
    total_teachers: int
    total_classes: int
    total_lessons: int
    total_live_sessions: int
    active_sessions_now: int
    total_questions_handled: int
    total_captions_generated: int
    sample_school_name: str
    district: str
    state: str
