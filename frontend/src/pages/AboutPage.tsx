import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { BridgeMotif } from '../components/BridgeMotif';
import { Target, Award, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      
      <PageHeader
        title="About SETU"
        subtitle="One classroom. Many ways to learn. A public-service digital accessibility initiative for inclusive Indian education."
        badgeText="SevaFirst 2026 • Swasth & Samavesh Bharat"
        badgeVariant="mint"
      />

      {/* Brand Statement & Vision */}
      <div className="civic-card p-8 bg-white dark:bg-[#142738] shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <BridgeMotif size="lg" variant="teal" />
          <div>
            <h2 className="text-xl font-bold text-[#19324A] dark:text-white">
              Brand Statement: Learning without barriers.
            </h2>
            <p className="text-sm text-[#0A625D] font-semibold">
              Modern Indian public-service assistive architecture.
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#526575] dark:text-[#9BB0C1]">
          In a mainstream Indian classroom, an instructor naturally presents using spoken lectures, textbooks, and blackboard notes. However, students experience diverse sensory and cognitive needs: hearing impairment, low vision, speech difficulties, and dyslexia.
        </p>
        <p className="text-sm leading-relaxed text-[#526575] dark:text-[#9BB0C1]">
          SETU is not just an AI transcription tool or a corporate video call add-on. It is a <strong>teacher-led multimodal accessibility layer</strong> that translates one teacher-approved lesson into four simultaneous pathways (Read, Listen, Respond, Follow) without multiplying teacher workload.
        </p>
      </div>

      {/* Comparative Architecture Matrix */}
      <div className="civic-card p-6 bg-white dark:bg-[#142738] shadow-sm space-y-4">
        <h3 className="font-bold text-base text-[#19324A] dark:text-white">
          Why Meeting Transcribers Fail in Mainstream Classrooms
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D8E2DC] text-[#19324A] dark:text-white font-bold bg-[#F7F9F8] dark:bg-[#0E1B26]">
                <th className="p-3">Capability</th>
                <th className="p-3">Generic Meeting Tools (Meet/Teams)</th>
                <th className="p-3 text-[#0A625D]">SETU Inclusive Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECE8] text-[#526575] dark:text-[#9BB0C1]">
              <tr>
                <td className="p-3 font-semibold text-[#19324A] dark:text-white">Target Context</td>
                <td className="p-3">Corporate remote video calls</td>
                <td className="p-3 font-semibold text-[#0A625D]">Physical & hybrid government schools</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#19324A] dark:text-white">Student Registration</td>
                <td className="p-3">Mandatory corporate accounts</td>
                <td className="p-3 font-semibold text-[#0A625D]">Zero accounts (6-character code / QR)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#19324A] dark:text-white">Tactile Diagram Descriptions</td>
                <td className="p-3">Unsupported</td>
                <td className="p-3 font-semibold text-[#0A625D]">Integrated pedagogical audio descriptions</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#19324A] dark:text-white">Assisted Speech (AAC)</td>
                <td className="p-3">Text chat only</td>
                <td className="p-3 font-semibold text-[#0A625D]">Tap-to-speak non-verbal phrase boards</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#19324A] dark:text-white">Child Data Protection</td>
                <td className="p-3">Cloud telemetry logging</td>
                <td className="p-3 font-semibold text-[#0A625D]">Zero profiling; ephemeral audio streams</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
