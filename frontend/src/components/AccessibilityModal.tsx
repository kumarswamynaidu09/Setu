import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { X, Sliders, Type, Eye, Volume2 } from 'lucide-react';
import { AccessibilityTheme, FontSize } from '../types';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    dyslexiaFont, setDyslexiaFont,
    speechRate, setSpeechRate,
    reducedMotion, setReducedMotion,
    t
  } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-900 dark:text-zinc-100">
              <Sliders className="w-4 h-4 text-red-500" aria-hidden="true" />
            </div>
            <div>
              <div className="nothing-label text-[10px] text-zinc-400">SETTINGS // PREFS</div>
              <h2 id="a11y-modal-title" className="text-lg font-bold font-heading">
                {t.accessibilitySettings.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Contrast & Theme */}
        <div className="mb-6">
          <label className="nothing-label block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2.5 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <span>( 01 ) {t.accessibilitySettings.contrast}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard', label: 'LIGHT', desc: 'Standard' },
              { id: 'high-contrast', label: 'CONTRAST', desc: 'WCAG AAA' },
              { id: 'dark', label: 'OBSIDIAN', desc: 'Dark Mode' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id as AccessibilityTheme)}
                aria-pressed={theme === opt.id}
                className={`p-3 rounded-2xl border text-center transition-all font-mono ${
                  theme === opt.id
                    ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Sizing */}
        <div className="mb-6">
          <label className="nothing-label block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2.5 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <span>( 02 ) {t.accessibilitySettings.fontSize}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: '100% (STD)' },
              { id: 'large', label: '125% (LRG)' },
              { id: 'extra-large', label: '150% (MAX)' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFontSize(opt.id as FontSize)}
                aria-pressed={fontSize === opt.id}
                className={`p-3 rounded-2xl border text-xs font-mono font-bold text-center transition-all ${
                  fontSize === opt.id
                    ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-600 dark:text-red-400 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dyslexia Typography Toggle */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
          <div>
            <div className="nothing-label text-xs font-bold text-zinc-800 dark:text-zinc-200">
              ( 03 ) DYSLEXIA TYPOGRAPHY
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">High legibility character distinction</div>
          </div>
          <button
            role="switch"
            aria-checked={dyslexiaFont}
            onClick={() => setDyslexiaFont(!dyslexiaFont)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
              dyslexiaFont ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                dyslexiaFont ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Speech Reading Speed */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="speech-rate-slider" className="nothing-label flex items-center gap-1.5 font-bold text-xs text-zinc-500 dark:text-zinc-400">
              <Volume2 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              <span>( 04 ) {t.accessibilitySettings.speechRate}</span>
            </label>
            <span className="font-mono text-xs font-bold text-red-500">{speechRate}x</span>
          </div>
          <input
            id="speech-rate-slider"
            type="range"
            min="0.75"
            max="1.5"
            step="0.25"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full accent-red-500 cursor-pointer"
          />
          <div className="flex justify-between font-mono text-[10px] text-zinc-400 mt-1">
            <span>0.75x</span>
            <span>1.00x</span>
            <span>1.50x</span>
          </div>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
          <div>
            <div className="nothing-label text-xs font-bold text-zinc-800 dark:text-zinc-200">
              ( 05 ) REDUCED MOTION
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">Dampens layout transitions</div>
          </div>
          <button
            role="switch"
            aria-checked={reducedMotion}
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
              reducedMotion ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                reducedMotion ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 nothing-btn-primary font-mono text-xs tracking-wider uppercase transition-all shadow-sm"
        >
          CONFIRM SETTINGS
        </button>
      </div>
    </div>
  );
};
