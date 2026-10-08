# Accessibility Conformance & Testing Guide — SETU

## WCAG 2.2 AA Standards Implementation

SETU treats accessibility as a non-negotiable core engineering requirement. The platform targets compliance with Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.

---

## 1. Supported Accessibility Capabilities

### Visual & Typography
- **Contrast Ratios:** Standard mode satisfies 4.5:1+ for body text and 3:1+ for large text. High-Contrast mode exceeds 7:1+ (WCAG Level AAA standard).
- **Scalable Typography:** Text sizes scale seamlessly across 100% (Normal), 125% (Large), and 150% (Extra Large) without breaking layout bounds or truncating labels.
- **Dyslexia-Friendly Layout:** Toggleable font styling with expanded character distinction, word-spacing (0.15em), and line-height (1.8).
- **Reduced Motion:** Fully honors `prefers-reduced-motion: reduce` by dampening animations and transitions.

### Spoken & Screen-Reader Support
- **Speech Synthesis (TTS):** Browser-native and system-integrated TTS reads lesson sections and verbal diagram descriptions in English, Hindi, and Telugu.
- **Pedagogical Spoken Descriptions:** Visual diagrams include teacher-reviewed verbal descriptions explaining scientific content to students with visual impairment.
- **Semantic Structure:** Native HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<dialog>`, `<button>`) provide natural screen reader landmarks.
- **Controlled ARIA Live Regions:** Live captions use `aria-live="polite"` to avoid interrupting screen-reader speech mid-sentence.

### Non-Verbal & Motor Access
- **Augmentative & Alternative Communication (AAC):** Mode 3 provides high-contrast, large-target phrase cards with icon support for students with speech difficulties.
- **Visible Focus Indicators:** Consistent 3px focus rings on all interactive elements.
- **Skip Link:** A `Skip to main content` anchor is available on every page.

---

## 2. Tested Assistive Technologies

| Assistive Tech | Platform / OS | Test Status | Notes |
| :--- | :--- | :--- | :--- |
| **NVDA** | Windows 11 | Verified | Full navigation across headings, buttons, and live captions |
| **TalkBack** | Android 14 | Verified | Verified touch exploration on student interface |
| **Keyboard-Only** | All Browsers | Verified | Full flow accessible with Tab / Shift+Tab / Space / Enter |
| **Browser Zoom** | Chrome / Edge | Verified | Tested up to 200% zoom without horizontal overflow |

---

## 3. Known Limitations & Recommendations
- Automated speech recognition may mishear fast speech or non-standard accents; the teacher's real-time caption edit/correction feature should always be used to verify critical concepts.
- Text-to-speech pronunciation of complex regional scientific terms varies depending on the client device's installed TTS engine.
