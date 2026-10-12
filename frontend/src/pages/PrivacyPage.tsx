import React from 'react';
import { ShieldCheck, Lock, UserX, FileCheck, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10 text-[#1A1A2E]">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4 border border-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Child Privacy & Data Governance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1A1A2E] tracking-tight">
          Privacy & Ethical Protections
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#6B7280] leading-relaxed">
          Because SETU is designed for school environments and minors, strict privacy by design is enforced across the architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="ios-card bg-white p-6 sm:p-7 border border-black/[0.06] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <UserX className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A2E]">
            No Student Registration Required
          </h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Students join sessions using temporary 6-character room codes. No email, phone number, government ID, or permanent account is created or stored for child participants.
          </p>
        </div>

        <div className="ios-card bg-white p-6 sm:p-7 border border-black/[0.06] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
            <EyeOff className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A2E]">
            Zero Disability Profiling
          </h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            We never prompt students to disclose a diagnosis or disability category. Students freely choose their sensory pathway (Read, Listen, Respond, Follow) at any time.
          </p>
        </div>

        <div className="ios-card bg-white p-6 sm:p-7 border border-black/[0.06] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A2E]">
            Ephemeral Audio & Transcripts
          </h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Classroom audio streams are processed in real time and discarded. Raw audio is never permanently recorded or stored. Captions are ephemeral to the active session.
          </p>
        </div>

        <div className="ios-card bg-white p-6 sm:p-7 border border-black/[0.06] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <FileCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A2E]">
            Ethical School Pilot Consent
          </h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Pilot deployments in government schools follow institutional authorization protocols, with informed guardian consent documentation provided to participating schools.
          </p>
        </div>
      </div>
    </div>
  );
};
