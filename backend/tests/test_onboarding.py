import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_onboarding_registration_and_profile_flow():
    rand_id = uuid.uuid4().hex[:8]
    email = f"student.test.{rand_id}@setu.edu.in"
    reg_payload = {
        "full_name": "Rohan Verma",
        "email": email,
        "password": "Password@123",
        "role": "student",
        "disabilities": [
            {
                "disability_type": "hearing",
                "severity": "severe",
                "preferences_json": '{"captions": true, "sign_language": true}'
            },
            {
                "disability_type": "vision",
                "severity": "mild",
                "preferences_json": '{"high_contrast": true, "font_size": "large"}'
            }
        ]
    }

    # 1. Register through onboarding
    res = client.post("/api/onboarding/register", json=reg_payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "student"
    assert data["full_name"] == "Rohan Verma"
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Duplicate registration should fail
    dup_res = client.post("/api/onboarding/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. GET profile
    prof_res = client.get("/api/onboarding/profile", headers=headers)
    assert prof_res.status_code == 200, prof_res.text
    prof = prof_res.json()
    assert prof["email"] == email
    assert prof["full_name"] == "Rohan Verma"
    assert prof["role"] == "student"
    assert prof["onboarding_completed"] is True
    assert len(prof["disability_profiles"]) == 2
    types = [d["disability_type"] for d in prof["disability_profiles"]]
    assert "hearing" in types
    assert "vision" in types

    # 4. PUT profile
    update_payload = {
        "full_name": "Rohan Verma Updated",
        "onboarding_completed": True,
        "disabilities": [
            {
                "disability_type": "hearing",
                "severity": "moderate",
                "preferences_json": '{"captions": true}'
            }
        ]
    }
    put_res = client.put("/api/onboarding/profile", json=update_payload, headers=headers)
    assert put_res.status_code == 200, put_res.text
    updated = put_res.json()
    assert updated["full_name"] == "Rohan Verma Updated"
    assert len(updated["disability_profiles"]) == 1
    assert updated["disability_profiles"][0]["disability_type"] == "hearing"
    assert updated["disability_profiles"][0]["severity"] == "moderate"

def test_auth_register_student_and_adult_learner():
    rand_id = uuid.uuid4().hex[:8]
    # Test auth register endpoint with student
    student_res = client.post("/api/auth/register", json={
        "email": f"student.direct.{rand_id}@setu.edu.in",
        "password": "Password@123",
        "full_name": "Direct Student",
        "role": "student"
    })
    assert student_res.status_code == 200, student_res.text
    assert student_res.json()["role"] == "student"

    # Test auth register endpoint with adult_learner
    adult_res = client.post("/api/auth/register", json={
        "email": f"adult.learner.{rand_id}@setu.edu.in",
        "password": "Password@123",
        "full_name": "Adult Learner",
        "role": "adult_learner"
    })
    assert adult_res.status_code == 200, adult_res.text
    assert adult_res.json()["role"] == "adult_learner"

