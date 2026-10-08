import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.database import Base, engine, SessionLocal
from app.seed import init_db_and_seed

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db_and_seed()
    yield

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_teacher_login():
    res = client.post("/api/auth/login", json={
        "email": "teacher.anita@setu.edu.in",
        "password": "SetuTeacher@2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "teacher"

def test_coordinator_login():
    res = client.post("/api/auth/login", json={
        "email": "coordinator@setu.edu.in",
        "password": "SetuAdmin@2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "coordinator"

def test_list_lessons():
    # Login as teacher
    login_res = client.post("/api/auth/login", json={
        "email": "teacher.anita@setu.edu.in",
        "password": "SetuTeacher@2026"
    })
    token = login_res.json()["access_token"]

    res = client.get("/api/lessons", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    lessons = res.json()
    assert len(lessons) > 0
    assert "Solar System" in lessons[0]["title"]

def test_start_session_and_student_join():
    # Login as teacher
    login_res = client.post("/api/auth/login", json={
        "email": "teacher.anita@setu.edu.in",
        "password": "SetuTeacher@2026"
    })
    token = login_res.json()["access_token"]

    # Get class
    classes_res = client.get("/api/classes", headers={"Authorization": f"Bearer {token}"})
    assert classes_res.status_code == 200
    classes = classes_res.json()
    assert len(classes) > 0
    class_id = classes[0]["id"]

    # Get lessons
    lessons_res = client.get(f"/api/lessons?class_id={class_id}", headers={"Authorization": f"Bearer {token}"})
    lesson_id = lessons_res.json()[0]["id"]

    # Start session
    start_res = client.post("/api/sessions/start", json={
        "class_id": class_id,
        "lesson_id": lesson_id
    }, headers={"Authorization": f"Bearer {token}"})
    assert start_res.status_code == 200
    session_data = start_res.json()
    room_code = session_data["room_code"]
    session_id = session_data["id"]

    # Student joins via room code
    join_res = client.post("/api/sessions/join", json={
        "room_code": room_code,
        "student_nickname": "Student Arya"
    })
    assert join_res.status_code == 200
    join_data = join_res.json()
    assert join_data["session_id"] == session_id
    assert join_data["lesson"] is not None
    assert len(join_data["lesson"]["sections"]) == 4

    # Student submits AAC question
    q_res = client.post("/api/questions", json={
        "session_id": session_id,
        "student_nickname": "Student Arya",
        "message_type": "aac_phrase",
        "content": "Why do we have day and night?"
    })
    assert q_res.status_code == 200
    q_data = q_res.json()
    assert q_data["status"] == "pending"
    q_id = q_data["id"]

    # Teacher acknowledges question
    ack_res = client.post("/api/questions/acknowledge", json={
        "question_id": q_id
    }, headers={"Authorization": f"Bearer {token}"})
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "acknowledged"

    # Teacher publishes announcement
    ann_res = client.post("/api/announcements", json={
        "session_id": session_id,
        "category": "Exam",
        "title": "Unit Test Next Monday",
        "content": "Please revise the Solar System chapters 1 to 4.",
        "priority": "normal"
    }, headers={"Authorization": f"Bearer {token}"})
    assert ann_res.status_code == 200
    assert ann_res.json()["title"] == "Unit Test Next Monday"

    # Teacher corrects caption
    # First post manual caption
    cap_res = client.post("/api/speech/captions/manual-stream", json={
        "session_id": session_id,
        "segment_index": 1,
        "text": "The Earth revolves around the sun.",
        "language": "en"
    }, headers={"Authorization": f"Bearer {token}"})
    assert cap_res.status_code == 200
    seg_id = cap_res.json()["id"]

    # Teacher corrects
    cor_res = client.post("/api/speech/captions/correct", json={
        "segment_id": seg_id,
        "corrected_text": "The Earth revolves around the Sun in 365 days."
    }, headers={"Authorization": f"Bearer {token}"})
    assert cor_res.status_code == 200
    assert cor_res.json()["is_corrected"] is True
    assert "365 days" in cor_res.json()["text"]

    # End session
    end_res = client.post(f"/api/sessions/{session_id}/end", headers={"Authorization": f"Bearer {token}"})
    assert end_res.status_code == 200
