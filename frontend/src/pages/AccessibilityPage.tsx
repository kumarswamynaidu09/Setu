import React from 'react';
import { ShieldCheck, Keyboard, Eye, Volume2, CheckCircle2, Sliders } from 'lucide-react';

export const AccessibilityPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 text-slate-800 dark:text-slate-200">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 text-xs font-bold mb-4">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>WCAG 2.2 AA Compliance Statement</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Accessibility at SETU
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Accessibility is our foundational engineering requirement. SETU is engineered to meet the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards.
        </p>
      </div>

      {/* Accessible Features Checklist */}
      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Key Assistive Engineering Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">High Contrast & Themes</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Standard (4.5:1+), High Contrast (7:1+ WCAG AAA), and Dark mode options.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Scalable Typography</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Full text scaling (100%, 125%, 150%) and optional dyslexia-friendly font layout.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Visible Focus & Skip Links</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Distinct 3px focus-visible rings on all interactive elements and skip-to-content links.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Spoken Descriptions</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Teacher-curated verbal audio descriptions for educational diagrams and images.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screen Reader & Assistive Technologies */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Tested Screen Readers and Input Methods
        </h2>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 text-sm">
          <p>
            SETU uses semantic HTML5 elements (<code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;button&gt;</code>, <code>&lt;dialog&gt;</code>) and restrained ARIA live regions to ensure assistive technologies announce captions and urgent announcements without creating sensory overload.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>NVDA & JAWS (Windows):</strong> Verified with standard tab navigation, heading shortcuts (H), and form field interaction.</li>
            <li><strong>TalkBack (Android):</strong> Tested on mobile form factors with touch exploration and gesture navigation.</li>
            <li><strong>Keyboard-Only:</strong> Complete application navigable via <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Tab</kbd>, <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Shift+Tab</kbd>, <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Enter</kbd>, and <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Space</kbd>.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
