# SETU 2.0 Implementation & Architecture Audit
**Date:** October 12, 2026  
**Repository:** https://github.com/manasvignesh/Setu  
**Branch:** `feat/setu-2.0-master`  
**Reference Commit:** `b62d6c92aa4deedff792ba3c1cdc07752def04f3`  

---

## 1. Executive Summary

This comprehensive audit inspects the frontend code, backend services, database models, WebSocket streaming mechanics, security controls, and accessibility implementations of SETU. It establishes verified working functionality, identifies critical defects, and specifies the required changes to achieve the SETU 2.0 standard: **a complete, robust, accessible learning and communication platform for Indian government and institutional inclusive education.**

---

## 2. Inventory of Current Implementation Status

### A. Implemented and Verified Working
1. **FastAPI Backend & Database Engine:**
   - Dual-database compatibility: local SQLite (`sqlite:///./setu_classroom.db`) and PostgreSQL (Supabase / Railway verified).
   - Relational models for `School`, `User`, `ClassRoom`, `Lesson`, `LessonSection`, `LiveSession`, `CaptionSegment`, `Announcement`, `StudentQuestion`, `DisabilityProfile`, `UsageMetric`.
   - Core API endpoints: Lesson CRUD (`/api/lessons`), Classroom management (`/api/classes`), Live session lifecycle (`/api/sessions/start`, `/api/sessions/join`), Announcements, Student questions, and Onboarding profile management.
   - 8 automated backend test cases passing via `pytest`.
2. **Frontend Foundation & Tooling:**
   - React 19 + TypeScript + Vite + Tailwind CSS 4 build pipeline.
   - Clean production build: zero TypeScript compiler errors.
   - Clean light palette and high-contrast typography across navigation, sign-in, and informational pages.
3. **Audio Synthesis & AAC Foundations:**
   - `useSpeechSynthesis.ts`: Standard browser Web Speech Synthesis hook with rate control, boundary tracking, and multi-language fallbacks (`hi-IN`, `te-IN`, `en-IN`).
   - Lesson representation modes: Multi-tab views for Read, Listen (TTS playback), and Follow (stepped navigation).

### B. Implemented but Broken or Fragile
1. **Speech Recognition Hook (`useSpeechRecognition.ts`):**
   - **Flaw:** Exclusively relies on client-side browser `webkitSpeechRecognition`. On Chromium / Windows, speech recognition terminates after brief silence or pauses and frequently fails continuous audio processing without an explicit manual restart.
   - **Impact:** Live Captions cannot reliably sustain 60+ seconds of continuous teacher speech.
2. **Backend Speech Recognition Adapter (`speech_service.py`):**
   - **Flaw:** Only accepts discrete audio chunks (`/transcribe-chunk`) using Python's `speech_recognition` wrapper around Google Web Speech. This is **batch transcription**, not real-time streaming STT with low-latency interim hypothesis delivery.
3. **Client-Side Authentication Fallback in Onboarding (`SignUpPage.tsx`):**
   - **Flaw:** Lines 210–220 generate local fake tokens (`local_token_...`) and synthesized users (`usr_...`) if backend API registration encounters any error.
   - **Impact:** Masks backend failures, leaving unauthenticated users believing they have an active account.

### C. Partially Implemented
1. **WebSocket Security & Role Authorization:**
   - **Flaw:** `/ws/live/{session_id}` accepts query parameters `?role=teacher&nickname=...` without requiring a valid JWT session ticket or verifying that the connecting socket actually belongs to the authenticated teacher of that session.
   - **Risk:** Any client can connect as `role=teacher` and broadcast interim captions or listen in.
2. **Disability Profiling vs. Interaction Preference:**
   - **Flaw:** Onboarding directly asks users to categorize themselves by medical diagnoses/disabilities (Hearing, Vision, Motor, Cognitive, Speech).
   - **Required:** Non-intrusive preference discovery: *"How would you like SETU to help you?"* (Understand spoken words, Learn with accessible lessons, Communicate more easily, Join my classroom).
3. **Personal Live Captions vs. Classroom Captions:**
   - **Flaw:** Live captions currently only function inside a teacher-started classroom session (`StudentSessionView` or `TeacherLiveClassroom`).
   - **Required:** Standalone **Personal Live Captions** mode where any user (e.g., a deaf individual attending a live conversation) can immediately activate microphone speech-to-text without joining a class.
4. **Standalone AAC / Communication:**
   - **Flaw:** AAC phrases currently exist only within the student classroom question panel.
   - **Required:** Standalone **Communicate** workspace with custom phrases, editable communication boards, and text-to-speech output outside of a classroom.

### D. Missing
1. **Streaming STT Provider Architecture:**
   - Missing a modular `StreamingSTTProvider` abstraction supporting WebSocket audio streaming (Deepgram Nova-3, Sarvam Realtime WebSocket, and browser fallback).
2. **Deterministic Caption Event Protocol:**
   - Need sequence numbers, utterance IDs, revisions, and explicit `CAPTION_PARTIAL`, `CAPTION_FINAL`, `CAPTION_CORRECTED`, and `CAPTION_STATUS` events.
3. **Civic Calm Design System Tokens:**
   - Full migration to institutional design tokens: Institutional Navy (`#19324A`), Inclusive Teal (`#0A625D`), Warm Saffron (`#B07822`), Soft Mint (`#E8F5F2`), Slate (`#526575`), Canvas (`#F7F9F8`).
4. **Coordinator and School Data Boundaries:**
   - Server-enforced tenancy isolating sessions and classes strictly by school.

---

## 3. Security, Privacy & Authorization Assessment

| Concern | Severity | Current State | Remediation |
| :--- | :--- | :--- | :--- |
| **WebSocket Role Spoofing** | High | Client specifies `role=teacher` in WS URL query. | Verify JWT bearer token or short-lived signed connection ticket on WS handshake. |
| **Privileged Self-Registration** | High | `role` parameter allowed in open registration. | Restrict public self-registration to `learner` / `teacher` (with valid school code). Prohibit admin/coordinator self-assignment. |
| **Synthetic Token Generation** | Medium | `SignUpPage.tsx` manufactures fake tokens on network failure. | Remove synthetic auth. Display transparent network/service error states. |
| **Raw Audio Privacy** | High | Audio chunks could linger if stored. | Ensure zero audio disk persistence. Audio streamed directly into memory buffers and discarded. |
| **CORS Policy** | Medium | `allow_origins=["*"]` configured in `main.py`. | Restrict to configured `ALLOWED_ORIGINS` in production settings. |

---

## 4. Accessibility (WCAG 2.2 AA) Audit

1. **Contrast & Theming:**
   - Previous dark-mode inversion classes on light backgrounds resolved in commit `b62d6c9`.
   - Civic Calm tokens provide ≥ 4.5:1 text contrast for body text and ≥ 7:1 for headers.
2. **Target Sizing:**
   - Interactive buttons must strictly guarantee $\ge 44 \times 44$ px (or 48px) touch targets for motor accessibility.
3. **Screen Reader Live Regions:**
   - Captions and announcements require `aria-live="polite"` or `aria-live="assertive"` so screen reader users receive timely spoken updates without focus interruption.
4. **Cognitive Distraction:**
   - Layouts must offer a focused, distraction-free caption view with adjustable font sizing and line spacing.

---

## 5. Architectural Blueprint for SETU 2.0

```
┌────────────────────────────────────────────────────────────────────────┐
│                               SETU 2.0                                 │
│             Learning and communication without barriers.               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  LIVE CAPTIONS   │      │      LEARN       │      │   COMMUNICATE    │
│ • Personal Mode  │      │ • Read format    │      │ • Standalone AAC │
│ • Classroom Mode │      │ • Listen (TTS)   │      │ • Classroom Q&A  │
│ • Streaming STT  │      │ • Follow stepped │      │ • Voice Output   │
│ • Subtitle Sizing│      │ • Understand Plain│     │ • Saved Phrases  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

---

## 6. Implementation Roadmap

- **Phase 0:** Security hardening (remove fake auth, enforce role boundaries, authenticate WebSockets).
- **Phase 1:** Genuine Streaming Live Captions (Streaming provider adapter, Personal & Classroom caption engines, live partials/finals).
- **Phase 2:** Civic Calm UI & Accessible Interaction Architecture (Design tokens, preference-driven onboarding, 3-pillar navigation).
- **Phase 3:** Accessible Learning (Read, Listen, Follow, Understand) & Standalone/Classroom AAC.
- **Phase 4:** Institutional Readiness & Verification (Automated tests, privacy enforcement, real microphone QA).
