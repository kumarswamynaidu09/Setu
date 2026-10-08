import React from 'react';
import { ShieldCheck, Lock, UserX, FileCheck, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 text-slate-800 dark:text-slate-200">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 text-xs font-bold mb-4">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Child Privacy & Data Governance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Privacy & Ethical Protections
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Because SETU is designed for school environments and minors, strict privacy by design is enforced across the architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No Student Registration Required
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Students join sessions using temporary 6-character room codes. No email, phone number, government ID, or permanent account is created or stored for child participants.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Zero Disability Profiling
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We never prompt students to disclose a diagnosis or disability category. Students freely choose their sensory pathway (Read, Listen, Respond, Follow) at any time.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Ephemeral Audio & Transcripts
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Classroom audio streams are processed in real time and discarded. Raw audio is never permanently recorded or stored. Captions are ephemeral to the active session.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Ethical School Pilot Consent
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Pilot deployments in government schools follow institutional authorization protocols, with informed guardian consent documentation provided to participating schools.
          </p>
        </div>
      </div>
    </div>
  );
};
