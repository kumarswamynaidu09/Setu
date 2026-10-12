import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { BridgeMotif } from '../components/BridgeMotif';

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
      <div className="ios-card p-6 sm:p-8 bg-white border border-black/[0.06] shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <BridgeMotif size="lg" variant="teal" />
          <div>
            <h2 className="text-xl font-bold text-[#1A1A2E]">
              Brand Statement: Learning without barriers.
            </h2>
            <p className="text-sm text-[#FF6B4A] font-semibold">
              Modern Indian public-service assistive architecture.
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#6B7280]">
          In a mainstream Indian classroom, an instructor naturally presents using spoken lectures, textbooks, and blackboard notes. However, students experience diverse sensory and cognitive needs: hearing impairment, low vision, speech difficulties, and dyslexia.
        </p>
        <p className="text-sm leading-relaxed text-[#6B7280]">
          SETU is not just an AI transcription tool or a corporate video call add-on. It is a <strong className="text-[#1A1A2E]">teacher-led multimodal accessibility layer</strong> that translates one teacher-approved lesson into four simultaneous pathways (Read, Listen, Respond, Follow) without multiplying teacher workload.
        </p>
      </div>

      {/* Comparative Architecture Matrix */}
      <div className="ios-card p-6 sm:p-8 bg-white border border-black/[0.06] shadow-sm space-y-4">
        <h3 className="font-bold text-base text-[#1A1A2E]">
          Why Meeting Transcribers Fail in Mainstream Classrooms
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.08] text-[#1A1A2E] font-bold bg-[#F5F5F3]">
                <th className="p-3">Capability</th>
                <th className="p-3">Generic Meeting Tools (Meet/Teams)</th>
                <th className="p-3 text-[#FF6B4A]">SETU Inclusive Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-[#6B7280]">
              <tr>
                <td className="p-3 font-semibold text-[#1A1A2E]">Target Context</td>
                <td className="p-3">Corporate remote video calls</td>
                <td className="p-3 font-semibold text-[#FF6B4A]">Physical & hybrid government schools</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#1A1A2E]">Curriculum Alignment</td>
                <td className="p-3">None (raw audio stream only)</td>
                <td className="p-3 font-semibold text-[#FF6B4A]">Live synchronization with textbook chapters</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#1A1A2E]">Child Privacy</td>
                <td className="p-3">Requires user accounts & recording consent</td>
                <td className="p-3 font-semibold text-[#FF6B4A]">Anonymous room codes, zero data retention</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#1A1A2E]">Indian Accents & Code-Switching</td>
                <td className="p-3">High error rate on regional terminology</td>
                <td className="p-3 font-semibold text-[#FF6B4A]">Trained phonetics with live interim correction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
