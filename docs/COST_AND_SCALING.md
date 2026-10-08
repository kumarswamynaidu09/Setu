# Cost Model & Scaling Strategy — SETU

## 1. Classroom Hardware & Infrastructure Requirements

SETU is specifically engineered to function on the existing ICT hardware already provisioned in Indian government schools (such as under PM SHRI, ICT @ Schools, and Samagra Shiksha schemes).

| Component | Minimum Specification | Recommended for Pilot |
| :--- | :--- | :--- |
| **Teacher Device** | Any standard laptop / PC (Intel i3 / Ryzen 3, 4GB RAM) or Android tablet | Standard teacher laptop with built-in microphone |
| **Student Devices** | Any smartphone or tablet with a modern browser (Android 9+) | 1 device per 1–4 students (shared or 1:1) |
| **Network** | Local School WiFi router or 4G Mobile Hotspot (2 Mbps upload) | Standard school broadband router |
| **Projector / Screen (Optional)** | Standard classroom projector or smart TV | Used for displaying room QR code & captions |

---

## 2. Operating & Maintenance Cost Analysis

Because SETU leverages open-source foundations (FastAPI, Web Speech, SQLite/PostgreSQL) and client-side accessible rendering, ongoing recurring software license costs are minimized.

### Estimated Cost Breakdown (Per School / Year)

| Item | Traditional Proprietary Tools | SETU Platform Model |
| :--- | :--- | :--- |
| **Software Licensing** | ₹15,000 – ₹45,000 / year (per teacher seat) | **₹0** (Open Source / Self-Hosted) |
| **Dedicated Hardware** | ₹60,000+ (Specialized proprietary AAC & FM systems) | **₹0** (Uses existing school laptops/smartphones) |
| **Speech Processing** | ₹2.00 – ₹4.50 / hour per classroom (Cloud STT APIs) | **₹0** (Hybrid local & browser speech pipeline) |
| **Server Hosting (Cloud deployment for 50 schools)** | ₹1,20,000 / year | **₹6,000 – ₹12,000 / year** (Lightweight VPS/Cloud Run) |
| **Annual Cost per Classroom** | ~₹25,000 – ₹50,000 | **< ₹250 / classroom / year** |

---

## 3. Local vs. Cloud Processing Tradeoffs

- **Local Network Mode:** When school internet is intermittent, the SETU backend can run directly on the teacher's laptop as a local server (`http://192.168.x.x:8000`). Connected students on the school WiFi receive captions, announcements, and AAC sync without consuming external internet bandwidth.
- **Cloud Hosted Mode:** When internet is stable, the school connects to the centralized district server, enabling remote coordinators to monitor accessibility usage across 100+ schools.

---

## 4. Phased Scaling Strategy for State Education Departments

```
Phase 1: Controlled School Pilot (Months 1–3)
  - 5 PM SHRI Government Model High Schools
  - 20 Classrooms, 600 Students
  - Focus: Teacher usability, AAC adoption, caption correction workflows

Phase 2: District-Level Expansion (Months 4–8)
  - 50 Mainstream Secondary Schools in 1 District
  - Integration with DIKSHA / State SCERT lesson repositories
  - Special educator training and feedback loops

Phase 3: State-Wide Rollout (Months 9–18)
  - Deployment via State Education Server Infrastructure
  - Multilingual support for all 22 scheduled Indian languages
```
