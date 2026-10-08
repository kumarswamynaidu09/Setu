# SETU — Product Overview
**Tagline:** One Classroom. Many Ways to Learn.  
**Competition:** SevaFirst Innovation Challenge 2026  
**Theme:** 03 — Swasth & Samavesh Bharat  
**Target Beneficiaries:** Students with diverse communication and sensory access needs in mainstream Indian government schools (Classes 5–10).

---

## 1. Problem Statement
In mainstream Indian classrooms, teaching relies primarily on spoken explanation and chalkboard writing. Students with hearing impairment, low vision, reading/learning difficulties (e.g., dyslexia), or speech challenges face significant barriers because educational content is locked into a single sensory format.

Schools cannot afford multiple disconnected specialized assistive devices or proprietary meeting tools that demand expensive subscriptions, individual student accounts, or constant high-speed broadband.

## 2. The Core Innovation
SETU is **not** an AI captioning app. It is a **teacher-led multimodal classroom accessibility layer**.

A teacher delivers or prepares **one single lesson**. SETU unlocks four simultaneous, accessible pathways for students:

1. **READ:** Live streaming captions with dyslexia-friendly fonts, high contrast (WCAG AAA), and real-time teacher corrections.
2. **LISTEN:** Spoken text-to-speech audio narration with verbal pedagogical descriptions for diagrams and images (vital for visually impaired learners).
3. **RESPOND:** Augmentative and Alternative Communication (AAC) cards with large touch targets, non-verbal classroom phrase presets, and real-time teacher acknowledgment.
4. **FOLLOW:** Step-by-step sequential concept cards with simplified language toggle and key science terminology highlights.

---

## 3. Product Architecture Summary
- **Frontend:** React 19, TypeScript (strict mode), Vite, Tailwind CSS with accessible color palettes and WCAG 2.2 focus management.
- **Backend:** Python FastAPI, SQLAlchemy ORM, SQLite/PostgreSQL, WebSockets for instant live classroom broadcasting.
- **Speech Engine:** Resilient speech recognition pipeline with classroom scientific vocabulary post-processing and client-side streaming fallback.
- **Privacy Design:** Anonymous student access via 6-character room codes. Zero collection of medical diagnoses, zero biometric facial recognition, and ephemeral audio processing.

---

## 4. Key Limitations & Ethical Boundaries
- SETU is an educational accessibility layer, **not** a medical diagnostic device, therapy platform, or replacement for certified special educators.
- Speech recognition accuracy depends on acoustic clarity and microphone quality. Teacher-in-the-loop live correction ensures scientific terms are verified before student display.
