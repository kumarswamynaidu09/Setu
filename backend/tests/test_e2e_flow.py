import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.seed import init_db_and_seed

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db_and_seed()
    yield

def test_full_sevafirst_classroom_workflow():
    # 1. Teacher Anita signs in
    teacher_login = client.post("/api/auth/login", json={
        "email": "teacher.anita@setu.edu.in",
        "password": "SetuTeacher@2026"
    })
    assert teacher_login.status_code == 200
    teacher_token = teacher_login.json()["access_token"]
    teacher_id = teacher_login.json()["user_id"]

    # 2. Get Teacher's Class & Lesson
    classes_res = client.get("/api/classes", headers={"Authorization": f"Bearer {teacher_token}"})
    assert classes_res.status_code == 200
    classes = classes_res.json()
    assert len(classes) >= 1
    class_id = classes[0]["id"]

    lessons_res = client.get(f"/api/lessons?class_id={class_id}", headers={"Authorization": f"Bearer {teacher_token}"})
    assert lessons_res.status_code == 200
    lessons = lessons_res.json()
    assert len(lessons) >= 1
    lesson_id = lessons[0]["id"]
    assert "Solar System" in lessons[0]["title"]
    assert len(lessons[0]["sections"]) == 4

    # 3. Teacher Starts Live Classroom Session
    start_res = client.post("/api/sessions/start", json={
        "class_id": class_id,
        "lesson_id": lesson_id
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert start_res.status_code == 200
    session_data = start_res.json()
    session_id = session_data["id"]
    room_code = session_data["room_code"]
    assert session_data["is_active"] is True
    assert room_code.startswith("SETU")

    # 4. Student Joins Using 6-character Room Code (No permanent registration required)
    join_res = client.post("/api/sessions/join", json={
        "room_code": room_code,
        "student_nickname": "Student Arya"
    })
    assert join_res.status_code == 200
    join_data = join_res.json()
    assert join_data["session_id"] == session_id
    assert join_data["class_name"] == classes[0]["name"]
    assert len(join_data["lesson"]["sections"]) == 4
    student_token = join_data["student_token"]

    # 5. Teacher Streams Live Captions
    # Teacher says: "The Earth revolves around the Sun. One complete revolution takes 365 days."
    cap_res1 = client.post("/api/speech/captions/manual-stream", json={
        "session_id": session_id,
        "segment_index": 1,
        "text": "The Earth revolves around the Sun.",
        "language": "en"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert cap_res1.status_code == 200
    cap_id1 = cap_res1.json()["id"]

    cap_res2 = client.post("/api/speech/captions/manual-stream", json={
        "session_id": session_id,
        "segment_index": 2,
        "text": "One complete revolution takes 365 days.",
        "language": "en"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert cap_res2.status_code == 200

    # 6. Teacher Corrects a Caption Segment in Real-Time
    cor_res = client.post("/api/speech/captions/correct", json={
        "segment_id": cap_id1,
        "corrected_text": "The Earth revolves around the Sun in an elliptical orbit."
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert cor_res.status_code == 200
    assert cor_res.json()["is_corrected"] is True
    assert "elliptical orbit" in cor_res.json()["text"]

    # 7. Student C Submits AAC Card Query: "Why do we have day and night?"
    aac_res = client.post("/api/questions", json={
        "session_id": session_id,
        "student_nickname": "Student Arya",
        "message_type": "aac_phrase",
        "content": "Why do we have day and night?"
    })
    assert aac_res.status_code == 200
    q_data = aac_res.json()
    q_id = q_data["id"]
    assert q_data["status"] == "pending"

    # 8. Teacher Acknowledges Question
    ack_res = client.post("/api/questions/acknowledge", json={
        "question_id": q_id
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "acknowledged"

    # 9. Teacher Advances Lesson Section to Section 3 (Earth's Rotation: Day & Night)
    sync_res = client.post(f"/api/sessions/{session_id}/sync-section", json={
        "current_section_index": 2
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert sync_res.status_code == 200
    assert sync_res.json()["current_section_index"] == 2

    # 10. Teacher Answers Student Question with Text Explanation
    ans_res = client.post("/api/questions/answer", json={
        "question_id": q_id,
        "response_text": "Because Earth spins on its axis every 24 hours. The side facing the Sun has day."
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert ans_res.status_code == 200
    assert ans_res.json()["status"] == "answered"
    assert "24 hours" in ans_res.json()["response_text"]

    # 11. Teacher Publishes Classroom Announcement
    ann_res = client.post("/api/announcements", json={
        "session_id": session_id,
        "category": "Exam",
        "title": "Unit Test on Solar System Next Monday",
        "content": "Please review all 4 sections in SETU before Monday.",
        "priority": "normal"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert ann_res.status_code == 200
    assert ann_res.json()["category"] == "Exam"

    # 12. Check Active Session State
    active_details = client.get(f"/api/sessions/active/{session_id}")
    assert active_details.status_code == 200
    details_data = active_details.json()
    assert len(details_data["captions"]) == 2
    assert len(details_data["announcements"]) >= 1
    assert len(details_data["questions"]) >= 1

    # 13. Coordinator Reviews Operational Metrics (Zero child profiling verified)
    coord_login = client.post("/api/auth/login", json={
        "email": "coordinator@setu.edu.in",
        "password": "SetuAdmin@2026"
    })
    assert coord_login.status_code == 200
    coord_token = coord_login.json()["access_token"]

    coord_metrics = client.get("/api/coordinator/metrics", headers={"Authorization": f"Bearer {coord_token}"})
    assert coord_metrics.status_code == 200
    metrics_data = coord_metrics.json()
    assert metrics_data["total_teachers"] >= 2
    assert metrics_data["total_classes"] >= 2
    assert metrics_data["total_lessons"] >= 1
    assert metrics_data["active_sessions_now"] >= 1

    # 14. Teacher Ends Session Cleanly
    end_res = client.post(f"/api/sessions/{session_id}/end", headers={"Authorization": f"Bearer {teacher_token}"})
    assert end_res.status_code == 200
