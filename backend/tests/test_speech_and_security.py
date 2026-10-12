import json
import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect
from app.main import app
from app.seed import init_db_and_seed

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db_and_seed()
    yield

def test_prevent_administrative_self_registration():
    # 1. Block coordinator self-registration in auth
    res_auth = client.post("/api/auth/register", json={
        "email": "hacker.coord@setu.edu.in",
        "password": "Password@123",
        "full_name": "Bad Actor",
        "role": "coordinator"
    })
    assert res_auth.status_code == 403
    assert "Administrative and coordinator accounts cannot be self-registered" in res_auth.json()["detail"]

    # 2. Block admin self-registration in auth
    res_admin = client.post("/api/auth/register", json={
        "email": "hacker.admin@setu.edu.in",
        "password": "Password@123",
        "full_name": "Bad Actor",
        "role": "admin"
    })
    assert res_admin.status_code == 403

    # 3. Block coordinator in onboarding
    res_onboard = client.post("/api/onboarding/register", json={
        "email": "hacker.onboard@setu.edu.in",
        "password": "Password@123",
        "full_name": "Bad Actor",
        "role": "coordinator",
        "disabilities": []
    })
    assert res_onboard.status_code == 403

def test_websocket_teacher_role_enforcement():
    # 1. Login as teacher to start a session
    login_res = client.post("/api/auth/login", json={
        "email": "teacher.anita@setu.edu.in",
        "password": "SetuTeacher@2026"
    })
    assert login_res.status_code == 200
    teacher_token = login_res.json()["access_token"]

    classes_res = client.get("/api/classes", headers={"Authorization": f"Bearer {teacher_token}"})
    class_id = classes_res.json()[0]["id"]

    start_res = client.post("/api/sessions/start", json={
        "class_id": class_id
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert start_res.status_code == 200
    session_id = start_res.json()["id"]

    # 2. Unauthenticated user claiming role=teacher must be rejected with 4003
    try:
        with client.websocket_connect(f"/ws/live/{session_id}?role=teacher") as ws:
            pass
        pytest.fail("Expected WebSocket to disconnect with 4003")
    except WebSocketDisconnect as e:
        assert e.code == 4003

    # 3. Authenticated teacher connects successfully
    with client.websocket_connect(f"/ws/live/{session_id}?role=teacher&token={teacher_token}") as ws_teacher:
        ws_teacher.send_json({"type": "PING"})
        # Connect emits PARTICIPANT_UPDATE first
        received = []
        for _ in range(3):
            msg = ws_teacher.receive_json()
            received.append(msg.get("type"))
            if msg.get("type") == "PONG":
                break
        assert "PONG" in received

    # 4. Anonymous student connects successfully
    with client.websocket_connect(f"/ws/live/{session_id}?role=student&nickname=Raju") as ws_student:
        ws_student.send_json({"type": "PING"})
        received = []
        for _ in range(3):
            msg = ws_student.receive_json()
            received.append(msg.get("type"))
            if msg.get("type") == "PONG":
                break
        assert "PONG" in received

def test_speech_stream_websocket():
    # Connect to streaming endpoint with mock provider
    with client.websocket_connect("/ws/speech/stream?provider=mock&language=en-IN") as ws:
        status_msg = ws.receive_json()
        assert status_msg["type"] == "CAPTION_STATUS"
        assert status_msg["status"] == "READY"
        assert status_msg["provider"] == "mock"

        # Send audio chunk of 2048 bytes
        dummy_audio = b"\x00" * 2048
        ws.send_bytes(dummy_audio)

        # Receive partial captions followed by final caption
        events = []
        for _ in range(5):
            ev = ws.receive_json()
            events.append(ev)
            if ev["type"] == "CAPTION_FINAL":
                break

        assert any(e["type"] == "CAPTION_PARTIAL" for e in events)
        final_ev = [e for e in events if e["type"] == "CAPTION_FINAL"][0]
        assert final_ev["is_final"] is True
        assert len(final_ev["text"]) > 0
