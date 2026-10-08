# Security & Child Privacy Architecture — SETU

## Overview
Because SETU is designed for school environments involving minors, privacy safeguards and security boundaries are enforced as core non-negotiable requirements.

---

## 1. Child Privacy Safeguards

### Zero Student Account Creation
- Students **never** register with email addresses, phone numbers, Aadhaar / National ID, or permanent credentials.
- Joining a session requires only a 6-character unguessable room code (e.g. `SETU89`).
- Student identifiers are ephemeral session tokens that expire when the session ends.

### Zero Disability Profiling
- The platform **never** asks students or teachers to declare a disability label, diagnosis, or medical classification.
- Every student has unrestricted access to all four modes (Read, Listen, Respond, Follow) at any time.

### Ephemeral Audio Processing
- Classroom audio streams are processed in real time to generate text captions and are immediately discarded.
- Raw classroom audio is **never stored or persisted** to disk.

---

## 2. Authentication & Server-Side Authorization

- **Teacher & Coordinator Access:** Secure bcrypt password hashing with salt, signed JWT bearer tokens (`HS256`).
- **Role Separation:** Role boundaries (`teacher`, `coordinator`, `admin`) are strictly verified on the backend for every API endpoint.
- **Join Token Protection:** Classroom room codes are generated with random entropy to prevent brute-force room enumeration.
- **Session Revocation:** When a teacher ends a live classroom session, all active WebSocket connections in that room receive `SESSION_ENDED` and the room is marked inactive.

---

## 3. Threat Model & Mitigations

| Threat | Risk Level | Mitigation in SETU |
| :--- | :--- | :--- |
| Unauthorized room eavesdropping | Low | Unguessable room codes, session expiry, teacher live participant count monitoring |
| Student data leakage | Very Low | Zero personally identifiable child data is stored in the database |
| Malicious injection in AAC/captions | Medium | Backend input sanitization, Pydantic strict typing, HTML entity escaping in React |
| Denial of service via rogue audio streams | Medium | Audio chunk size limits, file size restrictions, session token validation |

---

## 4. Pilot Consent & Governance Protocol
For school pilot deployments:
1. School administration issues institutional authorization.
2. Informed guardian notice is distributed explaining that SETU is an in-class accessibility tool that does not retain children's audio or biometric data.
3. Teachers retain full moderation control over all published classroom messages.
