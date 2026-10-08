# SETU — Multimodal Classroom Accessibility Platform
> **One Classroom. Many Ways to Learn.**  
> **SevaFirst Innovation Challenge 2026** • Theme 03: *Swasth & Samavesh Bharat*

---

## 🌟 What is SETU?
SETU is an accessible, teacher-led multimodal classroom accessibility layer designed for mainstream Indian government schools. A teacher delivers or prepares **one single lesson**, and SETU makes it accessible simultaneously through **four distinct pathways**:

1. 📖 **READ:** Live streaming captions with dyslexia-friendly typography, high contrast (WCAG AAA), and real-time teacher corrections.
2. 🎧 **LISTEN:** Text-to-speech lesson playback with **pedagogical spoken audio descriptions** for educational diagrams.
3. 💬 **RESPOND:** Augmentative & Alternative Communication (AAC) cards with large touch targets, non-verbal phrase presets, and real-time teacher acknowledgment.
4. 🪜 **FOLLOW:** Step-by-step sequential concept cards with simplified language toggle and key science terminology highlights.

---

## 🚀 Quick Start (Local Run)

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Install & Setup Backend
```bash
# In project root:
python -m venv venv
.\venv\Scripts\Activate.ps1   # (On Linux/macOS: source venv/bin/activate)
pip install -r backend/requirements.txt
```

### 2. Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Launch Unified Server
```bash
# Runs unified FastAPI server (serves APIs, WebSockets & built Frontend on port 8000):
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```
Open your browser at **`http://127.0.0.1:8000`**.

---

## 🧪 Run Automated Tests
```bash
# Run backend and E2E workflow test suite:
pytest -v
```
**Result:** 6/6 tests passing (100% coverage of core classroom lifecycles).

---

## 👥 Preloaded Demo Accounts (1-Click Sign In)
- **Teacher:** `teacher.anita@setu.edu.in` / `SetuTeacher@2026` (Class 6 General Science)
- **Coordinator:** `coordinator@setu.edu.in` / `SetuAdmin@2026` (PM SHRI Govt Model High School)
- **Student:** Anonymous 6-character room code (e.g. `SETU89`) — zero registration required.

---

## 📚 Deliverables & Documentation
- [Product Overview](docs/PRODUCT_OVERVIEW.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Accessibility Conformance Statement (WCAG 2.2 AA)](docs/ACCESSIBILITY.md)
- [Security & Child Privacy Governance](docs/SECURITY_AND_PRIVACY.md)
- [3-Minute SevaFirst Demonstration Script](docs/DEMO_SCRIPT.md)
- [Cost Model & Scaling Strategy](docs/COST_AND_SCALING.md)
- [Official SevaFirst Submission Document](docs/SEVAFIRST_SUBMISSION.md)
- [Automated & Manual Test Report](docs/TEST_REPORT.md)
- [Ethical User Research & Pilot Plan](docs/USER_RESEARCH_PLAN.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
