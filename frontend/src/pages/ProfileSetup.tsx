import React, { useState, useEffect } from 'react';
import {
  Ear,
  Eye,
  Hand,
  Brain,
  MessageSquare,
  Sparkles,
  Check,
  ArrowRight
} from 'lucide-react';
import type { DisabilityType } from './SignUpPage';

interface ProfileSetupProps {
  navigate: (route: string) => void;
}

interface DisabilityOption {
  id: DisabilityType;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const DISABILITY_OPTIONS: DisabilityOption[] = [
  {
    id: 'hearing',
    name: 'Hearing',
    desc: 'Live real-time captions & visual cues',
    icon: Ear,
    iconBg: 'bg-[#FF6B4A]/10',
    iconColor: 'text-[#FF6B4A]'
  },
  {
    id: 'vision',
    name: 'Vision',
    desc: 'Spoken descriptions & high contrast text',
    icon: Eye,
    iconBg: 'bg-[#4A90D9]/10',
    iconColor: 'text-[#4A90D9]'
  },
  {
    id: 'motor',
    name: 'Motor',
    desc: 'Single-switch access & large click areas',
    icon: Hand,
    iconBg: 'bg-[#2ECC71]/10',
    iconColor: 'text-[#2ECC71]'
  },
  {
    id: 'cognitive',
    name: 'Cognitive',
    desc: 'Clear bite-sized steps & reduced clutter',
    icon: Brain,
    iconBg: 'bg-[#8B5CF6]/10',
    iconColor: 'text-[#8B5CF6]'
  },
  {
    id: 'speech',
    name: 'Speech',
    desc: 'AAC phrase boards & text-to-speech voice',
    icon: MessageSquare,
    iconBg: 'bg-[#F59E0B]/10',
    iconColor: 'text-[#F59E0B]'
  },
  {
    id: 'none',
    name: 'No specific need',
    desc: 'Adaptive learning with standard preferences',
    icon: Sparkles,
    iconBg: 'bg-[#0D9488]/10',
    iconColor: 'text-[#0D9488]'
  }
];

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ navigate }) => {
  const [selectedDisabilities, setSelectedDisabilities] = useState<DisabilityType[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('setu_disability_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedDisabilities(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    // Default to hearing support if none stored
    setSelectedDisabilities(['hearing']);
  }, []);

  const toggleDisability = (id: DisabilityType) => {
    setSaved(false);
    if (id === 'none') {
      if (selectedDisabilities.includes('none')) {
        setSelectedDisabilities([]);
      } else {
        setSelectedDisabilities(['none']);
      }
      return;
    }

    const withoutNone = selectedDisabilities.filter(d => d !== 'none');
    if (withoutNone.includes(id)) {
      setSelectedDisabilities(withoutNone.filter(d => d !== id));
    } else {
      setSelectedDisabilities([...withoutNone, id]);
    }
  };

  const handleSave = () => {
    const finalSelection = selectedDisabilities.length === 0 ? ['none' as DisabilityType] : selectedDisabilities;
    setSelectedDisabilities(finalSelection);
    localStorage.setItem('setu_disability_profile', JSON.stringify(finalSelection));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A2E] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            aria-label="Back to Dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#1A1A2E] transition-colors py-2 px-3 rounded-full hover:bg-black/[0.04]"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to Dashboard</span>
          </button>

          {saved && (
            <div
              role="status"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2ECC71]/15 text-[#2ECC71] text-xs font-bold"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
              <span>Preferences Saved!</span>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[1.25rem] p-6 sm:p-8 shadow-xs border border-black/[0.04] space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
              What support would help you learn best?
            </h1>
            <p className="text-sm text-[#6B7280]">
              Select all that apply. You can change this anytime to adjust your lessons and live captions.
            </p>
          </div>

          {/* Cards Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2"
            role="group"
            aria-label="Disability support options"
          >
            {DISABILITY_OPTIONS.map((opt) => {
              const IconComponent = opt.icon;
              const isSelected = selectedDisabilities.includes(opt.id);

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleDisability(opt.id)}
                  aria-pressed={isSelected}
                  aria-label={`${opt.name}: ${opt.desc}`}
                  className={`relative p-4 rounded-[1.25rem] text-left transition-all border flex items-start gap-3.5 min-h-[76px] cursor-pointer ${
                    isSelected
                      ? 'border-[#FF6B4A] bg-[#FF6B4A]/5 ring-1 ring-[#FF6B4A]'
                      : 'border-black/[0.08] bg-[#FAFAF8] hover:border-black/[0.18]'
                  }`}
                >
                  <div
                    className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-full ${opt.iconBg} ${opt.iconColor} flex items-center justify-center shrink-0`}
                    aria-hidden="true"
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="font-bold text-sm text-[#1A1A2E]">
                      {opt.name}
                    </div>
                    <div className="text-xs text-[#6B7280] leading-snug line-clamp-2">
                      {opt.desc}
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#FF6B4A] text-white flex items-center justify-center shadow-xs"
                      aria-hidden="true"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={() => navigate('dashboard')}
              className="w-full sm:w-auto min-h-[48px] h-12 px-6 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1A1A2E] font-medium text-sm transition-all text-center"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              aria-label="Save disability profile"
              className="w-full sm:w-auto min-h-[48px] h-12 px-8 rounded-full bg-[#FF6B4A] hover:bg-[#e05636] active:scale-[0.98] text-white font-semibold text-base shadow-sm shadow-[#FF6B4A]/30 transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#FF6B4A]"
            >
              <span>Save Preferences</span>
              <Check className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
