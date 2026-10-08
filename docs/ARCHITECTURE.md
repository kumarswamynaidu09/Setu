# System Architecture — SETU

## High-Level System Architecture

```
+-------------------------------------------------------------------------+
|                              TEACHER DEVICE                             |
|  - React Frontend (Desktop / Tablet)                                    |
|  - Microphone Audio Capture                                             |
|  - In-Place Caption Editor & Correction                                 |
|  - Lesson Section Synchronizer & Announcement Publisher                 |
+-------------------+--------------------------------+--------------------+
                    |                                |
         REST APIs (Auth, CRUD)             WebSocket (Live Stream)
                    |                                |
                    v                                v
+-------------------------------------------------------------------------+
|                            CLASSROOM BACKEND                            |
|                            (Python FastAPI)                             |
|                                                                         |
|  +------------------------+  +---------------------------------------+  |
|  |    Speech Service      |  |           WebSocket Manager           |  |
|  |  - Audio chunk parser  |  |  - Room-based multi-client pub/sub    |  |
|  |  - Science vocab boost |  |  - Broadcasts: CAPTIONS, CORRECTIONS, |  |
|  |  - Latency profiler    |  |    ANNOUNCEMENTS, AAC QUESTIONS, SYNC |  |
|  +------------------------+  +---------------------------------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                    SQLAlchemy Relational Store                    |  |
|  |  - Users, Schools, Classes, Lessons, Sections, Captions, Metrics  |  |
|  +-------------------------------------------------------------------+  |
+-------------------+--------------------------------+--------------------+
                    |                                |
         REST APIs (Join, Query)             WebSocket (Events)
                    |                                |
                    v                                v
+-------------------------------------------------------------------------+
|                             STUDENT DEVICES                             |
|  - Anonymous connection via 6-character room code / QR                  |
|  - Multimodal Accessibility Interface:                                  |
|      [1] READ: Live High-Contrast Captions + Dyslexia Font              |
|      [2] LISTEN: Web Speech Synthesis TTS + Spoken Diagram Description  |
|      [3] RESPOND: Augmentative & Alternative Communication (AAC) Cards  |
|      [4] FOLLOW: Step-by-Step Concept Cards + Key Term Highlights       |
+-------------------------------------------------------------------------+
```

---

## Data Flow & Event Lifecycles

### 1. Live Captioning Flow
1. Teacher clicks **Start Live Speech**. The browser requests audio permissions and streams speech segments.
2. The backend receives the segment, applies classroom scientific vocabulary normalization (e.g. *revolution*, *solar system*, *gravity*), persists the segment, and publishes `CAPTION_NEW` over WebSocket.
3. All connected student devices receive the segment instantaneously and display it in Mode 1 (Read).
4. If the teacher detects a transcription error, clicking the edit icon modifies the segment and publishes `CAPTION_CORRECTED`, seamlessly updating all student screens.

### 2. Augmentative Communication (AAC) Flow
1. Student in Mode 3 taps a preset card (e.g., *"Why do we have day and night?"* or *"Please repeat that"*).
2. The student device can preview the phrase via speech output before sending.
3. The event `QUESTION_NEW` is forwarded to the teacher's Live Dashboard inbox.
4. The teacher clicks **Acknowledge** or types a direct explanation, triggering `QUESTION_ACKNOWLEDGED` / `QUESTION_ANSWERED` which updates the student's status badge in real time.

### 3. Lesson Section Synchronization Flow
1. In Mode 4 (Follow) or Mode 2 (Listen), students can either follow the teacher or navigate self-paced.
2. When the teacher advances a lesson section, a `SECTION_CHANGED` event shifts all synced student devices to the active section.

---

## Entity Relationship Schema

- **`schools`**: ID, name, code, district, state.
- **`users`**: ID, email, hashed_password, full_name, role (`teacher` / `coordinator`), school_id.
- **`classes`**: ID, name, grade, subject, section, teacher_id.
- **`lessons`**: ID, class_id, title, subject, grade, summary, language, is_published.
- **`lesson_sections`**: ID, lesson_id, order_index, title, content_text, simplified_text, key_terms, image_url, image_alt, image_pedagogical_description.
- **`live_sessions`**: ID, room_code (6-char unguessable code), class_id, lesson_id, teacher_id, is_active, current_section_index, started_at, ended_at.
- **`caption_segments`**: ID, session_id, segment_index, text, original_text, is_corrected, timestamp_ms, language.
- **`announcements`**: ID, session_id, category, title, content, priority.
- **`student_questions`**: ID, session_id, student_nickname, message_type, content, status (`pending`/`acknowledged`/`answered`), response_text.
- **`usage_metrics`**: ID, event_type, session_id, created_at.
