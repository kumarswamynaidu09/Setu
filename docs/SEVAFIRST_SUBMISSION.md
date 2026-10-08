# SevaFirst Innovation Challenge 2026 — Official Submission Document

**Product Name:** SETU  
**Tagline:** One Classroom. Many Ways to Learn.  
**Theme:** 03 — Swasth & Samavesh Bharat  
**Category / Track:** Product / Technology  
**Participation Level:** Undergraduate and Above  
**Target Sector:** Inclusive Education / Assistive Technology for Indian Schools  

---

## 1. Executive Summary
SETU is an accessible, teacher-led multimodal classroom platform engineered for mainstream Indian government schools. It transforms how children with diverse sensory, communication, and learning needs access mainstream education. 

Instead of requiring teachers to master several disjointed tools or forcing schools to purchase prohibitively expensive individual assistive hardware, SETU allows a teacher to deliver or prepare **one lesson** and simultaneously makes it available through **four accessible pathways: Read (Captions), Listen (TTS & Audio Descriptions), Respond (AAC Cards), and Follow (Step-by-Step Concepts)**.

---

## 2. Problem Statement & Ground Realities
In standard Indian government classrooms:
1. Instruction is predominantly oral and blackboard-based.
2. Students with hearing loss miss critical spoken instructions and announcements.
3. Students with visual impairment cannot interpret blackboard sketches or textbook diagrams.
4. Students with speech difficulties or social communication challenges cannot easily participate or ask questions.
5. Students with reading difficulties (dyslexia, cognitive delay) struggle with long dense paragraphs.

Existing video conferencing solutions (Google Meet, Microsoft Teams) are built for corporate meetings, require individual student corporate logins, do not support teacher caption corrections, lack non-verbal AAC cards, and consume heavy internet data.

---

## 3. Our Key Innovation: Multimodal Classroom Layer
SETU introduces a unified **Multimodal Accessibility Layer**:
- **Teacher Workflow Simplicity:** Teachers use one dashboard to create classes, import lesson notes, capture microphone speech, publish announcements, and review student questions.
- **Student Multimodal Autonomy:** Students join anonymously via a 6-character room code on any smartphone or tablet and freely switch between four sensory modes without disclosing or being labeled with a disability diagnosis.
- **Teacher-in-the-Loop Corrections:** Live caption errors can be corrected on-the-fly by the teacher, instantly updating all student screens with verified scientific terminology.
- **Two-Way Non-Verbal Participation:** Augmentative & Alternative Communication (AAC) cards give non-verbal students an immediate voice in class with live acknowledgment from the teacher.

---

## 4. Distinction from Existing Products

| Feature | Video Call Tools (Meet/Teams) | Standalone AAC Apps | Standalone Note Takers | SETU Platform |
| :--- | :--- | :--- | :--- | :--- |
| **Classroom Workflow** | No (Meeting-first) | No (Personal therapy) | No (Individual study) | **Yes (Classroom-first)** |
| **Multimodal 4 Modes** | Captions only | AAC only | Text notes only | **Read, Listen, Respond, Follow** |
| **Teacher Live Correction** | No | N/A | No | **Instant real-time broadcast** |
| **Child Privacy** | Requires accounts | Device-only | Cloud account required | **Anonymous 6-char Room Code** |
| **Spoken Diagram Descriptions** | No | No | No | **Teacher-reviewed audio descriptions** |
| **Affordability for Govt Schools** | High subscription | High app cost | Paid subscription | **< ₹250/classroom/yr (Open Source)** |

---

## 5. Working Prototype Evidence
The working prototype includes:
1. **Fully functional FastAPI backend** with WebSocket live event hub, SQLAlchemy SQLite/PostgreSQL store, and JWT role-based authorization.
2. **Accessible React 19 TypeScript frontend** adhering to WCAG 2.2 Level AA guidelines (Standard, High-Contrast AAA, Dark themes, Dyslexia typography, Text scaling 100%–150%).
3. **Live Microphone Speech Recognition & Correction Engine** with scientific terminology enhancements.
4. **Multilingual UI Support** for English, Hindi (हिंदी), and Telugu (తెలుగు).
5. **Demonstration Dataset** featuring *Class 6 Science — The Solar System and Earth's Movements*.
6. **100% Passing Automated Test Suite** verifying full session lifecycle, student joining, caption correction, AAC submission, and announcement delivery.

---

## 6. Government Adoption & Feasibility
SETU is designed for seamless adoption under India's **National Education Policy (NEP 2020)** and **Samagra Shiksha Abhiyan**:
- Compatible with existing PM SHRI school computer labs and teacher smart devices.
- Ready for integration with DIKSHA, PM eVIDYA, and State SCERT curriculum repositories.
- Zero collection of sensitive student biometric or diagnostic data ensures complete compliance with data protection principles.
