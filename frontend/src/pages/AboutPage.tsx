import React from 'react';
import { Target, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 text-zinc-800 dark:text-zinc-200 font-body">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold mb-4">
          <span className="glyph-dot" />
          <span>PRODUCT IDENTITY // SEVAFIRST 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-zinc-950 dark:text-white tracking-tight">
          What is SETU?
        </h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
          SETU is an accessible, teacher-led multimodal classroom platform designed for mainstream Indian government schools under Theme 03 (Swasth & Samavesh Bharat).
        </p>
      </div>

      {/* The Core Innovation */}
      <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="nothing-label text-[10px] text-red-500 font-bold">[ INNOVATION PRINCIPLE ]</div>
        <h2 className="text-xl font-bold font-heading text-zinc-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-red-500" />
          <span>The Core Innovation</span>
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          In typical Indian classrooms, teachers use a combination of blackboard writing and spoken lecture. Students with hearing impairment, low vision, reading difficulties, or speech challenges frequently struggle because the content is locked into a single sensory format.
        </p>
        <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          SETU does <strong>not</strong> claim to have invented transcription, TTS, or summarization. Our innovation is the <strong>unified classroom workflow</strong>: a teacher prepares or delivers one lesson, and SETU automatically unlocks four simultaneous accessible pathways without burdening the teacher with four different software tools.
        </p>
      </section>

      {/* Differentiation Table */}
      <section className="space-y-4">
        <div className="nothing-label text-[10px] text-zinc-400 font-bold">[ COMPARISON MATRIX ]</div>
        <h2 className="text-xl font-bold font-heading text-zinc-900 dark:text-white">
          How SETU Differs From Generic Meeting Tools
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3.5">CAPABILITY</th>
                <th className="p-3.5">MEETING TOOLS (MEET/TEAMS)</th>
                <th className="p-3.5 text-red-500">SETU INCLUSIVE LAYER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-normal">
              <tr>
                <td className="p-3.5 font-bold">Workflow Target</td>
                <td className="p-3.5 text-zinc-400">Corporate remote video calls</td>
                <td className="p-3.5 font-bold text-zinc-900 dark:text-white">Physical & hybrid Indian classrooms</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Multimodal Output</td>
                <td className="p-3.5 text-zinc-400">Live text captions only</td>
                <td className="p-3.5 font-bold text-zinc-900 dark:text-white">Read, Listen (TTS & diagrams), Respond (AAC), Follow steps</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Teacher Caption Corrections</td>
                <td className="p-3.5 text-zinc-400">Not supported; errors remain on screen</td>
                <td className="p-3.5 font-bold text-zinc-900 dark:text-white">Real-time correction & instantaneous student broadcast</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Non-Verbal Participation</td>
                <td className="p-3.5 text-zinc-400">Standard text chatbox</td>
                <td className="p-3.5 font-bold text-zinc-900 dark:text-white">Augmentative & Alternative Communication (AAC) cards</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Child Privacy & Access</td>
                <td className="p-3.5 text-zinc-400">Requires individual corporate accounts</td>
                <td className="p-3.5 font-bold text-zinc-900 dark:text-white">Zero-data anonymous QR / 6-character room code join</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Scope and Boundaries */}
      <section className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-2 font-body">
        <div className="nothing-label text-[10px] text-zinc-400 font-bold">[ SCOPE // BOUNDARIES ]</div>
        <h3 className="font-bold font-heading text-sm text-zinc-900 dark:text-white">
          Educational Support, Not Medical Diagnosis
        </h3>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          SETU is an educational accessibility layer. It is <strong>not</strong> a medical device, diagnostic system, therapy platform, or replacement for certified special education personnel. It is designed to assist teachers in making mainstream classroom instruction accessible to all students.
        </p>
      </section>
    </div>
  );
};
