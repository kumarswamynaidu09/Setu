import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { AppLanguage, FontSize, AccessibilityTheme } from '../types';
import { Type, Moon, Sun, Eye, Sliders, Volume2, Globe } from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    dyslexiaFont, setDyslexiaFont,
    speechRate, setSpeechRate,
    language, setLanguage,
    t
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Accessibility settings"
        className="btn-civic-secondary text-xs py-1.5 px-3 rounded-lg border border-[#D8E2DC] dark:border-[#25435E] shadow-2xs hover:bg-[#E8F5F2] dark:hover:bg-[#19324A] transition-colors"
      >
        <Sliders className="w-4 h-4 text-[#0A625D]" />
        <span className="font-semibold text-[#19324A] dark:text-white">Accessibility</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 mt-2 w-80 z-50 bg-white dark:bg-[#142738] border border-[#D8E2DC] dark:border-[#25435E] rounded-2xl shadow-xl p-5 space-y-5 text-sm"
            role="dialog"
            aria-label="Accessibility preferences panel"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE8] dark:border-[#1F364C]">
              <h3 className="font-bold text-[#19324A] dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0A625D]" />
                <span>Reading & Display Preferences</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-[#526575] hover:text-[#19324A] dark:text-[#9BB0C1] font-bold"
              >
                Close
              </button>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#19324A] dark:text-[#F0F6F5] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#0A625D]" />
                <span>Language / भाषा / భాష</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'hi', label: 'हिन्दी' },
                  { id: 'te', label: 'తెలుగు' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as AppLanguage)}
                    className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center transition-colors ${
                      language === lang.id
                        ? 'bg-[#0A625D] text-white border-[#084E4A]'
                        : 'bg-[#F7F9F8] dark:bg-[#0E1B26] text-[#19324A] dark:text-[#F0F6F5] border-[#D8E2DC] dark:border-[#25435E] hover:bg-[#E8F5F2]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#19324A] dark:text-[#F0F6F5] flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#0A625D]" />
                <span>Text Size</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'normal', label: 'Default' },
                  { id: 'large', label: 'Large (125%)' },
                  { id: 'extra-large', label: 'Largest (150%)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFontSize(s.id as FontSize)}
                    className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center transition-colors ${
                      fontSize === s.id
                        ? 'bg-[#0A625D] text-white border-[#084E4A]'
                        : 'bg-[#F7F9F8] dark:bg-[#0E1B26] text-[#19324A] dark:text-[#F0F6F5] border-[#D8E2DC] dark:border-[#25435E] hover:bg-[#E8F5F2]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contrast / Color Theme */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#19324A] dark:text-[#F0F6F5] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#0A625D]" />
                <span>Contrast Theme</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'standard', label: 'Standard' },
                  { id: 'high-contrast', label: 'High (AAA)' },
                  { id: 'dark', label: 'Dark Navy' }
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id as AccessibilityTheme)}
                    className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center transition-colors ${
                      theme === th.id
                        ? 'bg-[#19324A] text-white border-[#0E1B26]'
                        : 'bg-[#F7F9F8] dark:bg-[#0E1B26] text-[#19324A] dark:text-[#F0F6F5] border-[#D8E2DC] dark:border-[#25435E] hover:bg-[#E8F5F2]'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dyslexia Friendly Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-[#19324A] dark:text-[#F0F6F5]">
                Dyslexia-Friendly Spacing
              </span>
              <button
                role="switch"
                aria-checked={dyslexiaFont}
                onClick={() => setDyslexiaFont(!dyslexiaFont)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  dyslexiaFont ? 'bg-[#0A625D]' : 'bg-[#CBD5E1] dark:bg-[#334E68]'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                    dyslexiaFont ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Speech Rate Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold text-[#19324A] dark:text-[#F0F6F5]">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-[#0A625D]" />
                  Audio Speed
                </span>
                <span>{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.25"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-[#0A625D]"
                aria-label="Text to speech playback speed"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
