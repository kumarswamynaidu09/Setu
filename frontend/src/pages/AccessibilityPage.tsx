import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AccessibilityPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 text-zinc-800 dark:text-zinc-200 font-body">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold mb-4">
          <span className="glyph-dot" />
          <span>WCAG 2.2 AA CONFORMANCE STATEMENT</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-zinc-950 dark:text-white tracking-tight">
          Accessibility at SETU
        </h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
          Accessibility is our foundational engineering requirement. SETU is engineered to meet the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards.
        </p>
      </div>

      {/* Accessible Features Checklist */}
      <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-6">
        <div className="nothing-label text-[10px] text-red-500 font-bold">[ ASSISTIVE FEATURES ]</div>
        <h2 className="text-xl font-bold font-heading text-zinc-900 dark:text-white">
          Key Assistive Engineering Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
            <span className="glyph-dot mt-1 shrink-0" />
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">High Contrast & Themes</h3>
              <p className="text-[11px] text-zinc-500 mt-1 font-normal font-body">
                Standard (4.5:1+), High Contrast (7:1+ WCAG AAA), and Dark Obsidian options.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
            <span className="glyph-dot mt-1 shrink-0" />
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">Scalable Typography</h3>
              <p className="text-[11px] text-zinc-500 mt-1 font-normal font-body">
                Text scaling (100%, 125%, 150%) and optional dyslexia-friendly font layout.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
            <span className="glyph-dot mt-1 shrink-0" />
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">Visible Focus & Skip Links</h3>
              <p className="text-[11px] text-zinc-500 mt-1 font-normal font-body">
                Distinct 2px Nothing Red focus rings on interactive elements and skip links.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
            <span className="glyph-dot mt-1 shrink-0" />
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">Spoken Descriptions</h3>
              <p className="text-[11px] text-zinc-500 mt-1 font-normal font-body">
                Teacher-reviewed verbal audio descriptions for educational diagrams and images.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screen Reader & Assistive Technologies */}
      <section className="space-y-4">
        <div className="nothing-label text-[10px] text-zinc-400 font-bold">[ COMPATIBILITY REPORT ]</div>
        <h2 className="text-xl font-bold font-heading text-zinc-900 dark:text-white">
          Tested Screen Readers and Input Methods
        </h2>
        <div className="bg-zinc-50 dark:bg-zinc-900/60 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs font-mono">
          <p className="font-body text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            SETU uses semantic HTML5 elements and restrained ARIA live regions to ensure assistive technologies announce captions without sensory overload.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-300 font-mono">
            <li><strong>NVDA & JAWS (Windows):</strong> Verified with standard tab navigation and heading shortcuts (H).</li>
            <li><strong>TalkBack (Android):</strong> Tested on mobile form factors with touch exploration.</li>
            <li><strong>Keyboard-Only:</strong> Full flow navigable via Tab, Shift+Tab, Enter, and Space.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
