import React from 'react';
import { Target, CheckCircle2, XCircle, BookOpen, Layers, Award, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 text-slate-800 dark:text-slate-200">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 text-xs font-bold mb-4">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Product Overview • SevaFirst Innovation Challenge 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          What is SETU?
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          SETU is an accessible, teacher-led multimodal classroom platform designed for mainstream Indian government schools under Theme 03 (Swasth & Samavesh Bharat).
        </p>
      </div>

      {/* The Core Innovation */}
      <section className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          The Core Innovation
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          In typical Indian classrooms, teachers use a mix of blackboard writing and spoken lecture. Students with hearing impairment, low vision, reading difficulties, or speech challenges frequently struggle because the content is locked into a single sensory format.
        </p>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          SETU does <strong>not</strong> claim to have invented transcription, TTS, or summarization. Our innovation is the <strong>unified classroom workflow</strong>: a teacher prepares or delivers one lesson, and SETU automatically unlocks four simultaneous accessible pathways without burdening the teacher with four different software tools.
        </p>
      </section>

      {/* Differentiation Table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          How SETU Differs From Generic Meeting Tools
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-4">Capability</th>
                <th className="p-4">Generic Meeting Tools (Meet/Teams)</th>
                <th className="p-4 text-blue-700 dark:text-blue-400">SETU Inclusive Layer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="p-4 font-semibold">Workflow Target</td>
                <td className="p-4 text-slate-500">Corporate remote video calls</td>
                <td className="p-4 font-bold text-teal-700 dark:text-teal-400">Physical & hybrid Indian classrooms</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Multimodal Output</td>
                <td className="p-4 text-slate-500">Live text captions only</td>
                <td className="p-4 font-bold text-teal-700 dark:text-teal-400">Read, Listen (TTS & diagrams), Respond (AAC), Follow steps</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Teacher Caption Corrections</td>
                <td className="p-4 text-slate-500">Not supported; errors remain on screen</td>
                <td className="p-4 font-bold text-teal-700 dark:text-teal-400">Real-time correction & instantaneous student broadcast</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Non-Verbal Participation</td>
                <td className="p-4 text-slate-500">Standard text chatbox</td>
                <td className="p-4 font-bold text-teal-700 dark:text-teal-400">Augmentative & Alternative Communication (AAC) cards</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Child Privacy & Access</td>
                <td className="p-4 text-slate-500">Requires individual corporate accounts</td>
                <td className="p-4 font-bold text-teal-700 dark:text-teal-400">Zero-data anonymous QR / 6-character room code join</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Scope and Boundaries */}
      <section className="bg-blue-50/60 dark:bg-blue-950/40 p-6 rounded-3xl border border-blue-200 dark:border-blue-800 space-y-3">
        <h3 className="font-bold text-lg text-blue-950 dark:text-blue-200">
          Scope and Ethical Boundaries
        </h3>
        <p className="text-sm leading-relaxed text-blue-900/90 dark:text-blue-300">
          SETU is an educational accessibility layer. It is <strong>not</strong> a medical device, diagnostic system, therapy platform, or replacement for certified special education personnel. It is designed to assist teachers in making mainstream classroom instruction accessible to all students.
        </p>
      </section>
    </div>
  );
};
