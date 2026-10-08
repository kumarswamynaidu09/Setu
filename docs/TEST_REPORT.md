# Automated & Manual Test Report — SETU Platform

**Date of Execution:** Current Build  
**Environment:** Windows 11, Node v22.22.2, Python 3.14.3, FastAPI 0.142.4, React 19, TypeScript 5.9  
**Test Suite Status:** **6 / 6 PASSED (100%)**

---

## 1. Automated Test Execution Summary

```
============================= test session starts =============================
platform win32 -- Python 3.14.3, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\Public\setu, configfile: pytest.ini, testpaths: backend/tests
plugins: anyio-4.15.1
collected 6 items

backend/tests/test_api.py::test_health PASSED                            [ 16%]
backend/tests/test_api.py::test_teacher_login PASSED                     [ 33%]
backend/tests/test_api.py::test_coordinator_login PASSED                 [ 50%]
backend/tests/test_api.py::test_list_lessons PASSED                      [ 66%]
backend/tests/test_api.py::test_start_session_and_student_join PASSED    [ 83%]
backend/tests/test_e2e_flow.py::test_full_sevafirst_classroom_workflow PASSED [100%]

======================== 6 passed, 2 warnings in 2.77s ========================
```

---

## 2. Tested End-to-End Workflow Verification

| Step # | Tested Workflow | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **1** | Educator Authentication | Secure JWT token returned with role (`teacher`/`coordinator`) | 200 OK, JWT returned | **PASS** |
| **2** | Class & Lesson Listing | Returns Class 6 Science & 4 accessible sections | 200 OK, 4 sections loaded | **PASS** |
| **3** | Live Session Creation | Generates unique 6-char room code (e.g. `SETU89`) | 200 OK, active session created | **PASS** |
| **4** | Anonymous Student Join | Joins with room code without email/password | 200 OK, student token issued | **PASS** |
| **5** | Speech Caption Streaming | Streams captions over WebSocket to all room clients | 200 OK, delivered to students | **PASS** |
| **6** | Real-Time Caption Correction | Teacher corrects segment text; broadcasts update | 200 OK, `CAPTION_CORRECTED` received | **PASS** |
| **7** | AAC Question Submission | Student submits "Why do we have day and night?" | 200 OK, appears in teacher inbox | **PASS** |
| **8** | Teacher Question Acknowledge | Teacher acknowledges; student receives confirmation badge | 200 OK, `QUESTION_ACKNOWLEDGED` broadcast | **PASS** |
| **9** | Lesson Section Synchronization | Teacher changes section; students auto-navigate | 200 OK, `SECTION_CHANGED` broadcast | **PASS** |
| **10** | Teacher Announcement | Teacher publishes Exam notice; banner displays with TTS | 200 OK, `ANNOUNCEMENT_NEW` broadcast | **PASS** |
| **11** | Coordinator Telemetry | Aggregated operational metrics with 0 child profiling | 200 OK, verified | **PASS** |
| **12** | Clean Session Termination | Teacher ends session; room marked inactive | 200 OK, `SESSION_ENDED` broadcast | **PASS** |

---

## 3. Frontend Type-Check & Production Build Report

- **Tool:** Vite 8.3.3 + TypeScript Compiler `tsc -b`
- **Output Files:**
  - `dist/index.html` (0.45 kB)
  - `dist/assets/index-*.css` (58.68 kB)
  - `dist/assets/index-*.js` (405.78 kB)
- **Status:** **0 Errors, Built cleanly in 7.72s**.

---

## 4. Manual Accessibility Inspection

- **WCAG Contrast Ratios:** Checked with high contrast mode (7:1+ verified on all body text and icons).
- **Keyboard Navigation:** Verified Tab, Shift+Tab, Enter, Space across all modals, AAC cards, and lesson cards.
- **Visible Focus States:** 3px outline ring on all active focus targets.
- **Multilingual Unicode Rendering:** Verified correct script rendering for Hindi (हिंदी) and Telugu (తెలుగు).
