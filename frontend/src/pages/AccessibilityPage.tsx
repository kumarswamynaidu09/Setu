import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AccessibilityPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10 text-[#1A1A2E]">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span>WCAG 2.2 AA CONFORMANCE STATEMENT</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1A1A2E] tracking-tight">
          Accessibility at SETU
        </h1>
        <p className="mt-3 text-base text-[#6B7280] leading-relaxed">
          Accessibility is our foundational engineering requirement. SETU is engineered to meet the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards.
        </p>
      </div>

      {/* Accessible Features Checklist */}
      <section className="ios-card bg-white p-6 sm:p-8 border border-black/[0.06] space-y-6 shadow-sm">
        <div className="text-xs text-[#FF6B4A] font-bold uppercase tracking-wider">Assistive Features</div>
        <h2 className="text-xl font-bold text-[#1A1A2E]">
          Key Assistive Engineering Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#2ECC71] mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-[#1A1A2E]">High Contrast & Themes</h3>
              <p className="text-[12px] text-[#6B7280] mt-1">
                Standard (4.5:1+), High Contrast (7:1+ WCAG AAA), and clear readability on all devices.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#2ECC71] mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-[#1A1A2E]">Scalable Typography</h3>
              <p className="text-[12px] text-[#6B7280] mt-1">
                Text scaling (100%, 125%, 150%) and optional dyslexia-friendly font layout.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#2ECC71] mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-[#1A1A2E]">Visible Focus & Skip Links</h3>
              <p className="text-[12px] text-[#6B7280] mt-1">
                Distinct focus rings on interactive elements and skip links for keyboard-only navigation.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#2ECC71] mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-[#1A1A2E]">Screen Reader Optimizations</h3>
              <p className="text-[12px] text-[#6B7280] mt-1">
                Semantic ARIA live regions for realtime captions, announcements, and classroom status.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
