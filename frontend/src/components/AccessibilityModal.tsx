import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { X, Sliders, Type, Eye, Volume2, Sparkles } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 rounded-lg">
              <Sliders className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 id="a11y-modal-title" className="text-xl font-bold">
              {t.accessibilitySettings.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Contrast & Theme */}
        <div className="mb-6">
          <label className="flex items-center gap-2 font-semibold text-sm mb-3">
            <Eye className="w-4 h-4 text-blue-600" aria-hidden="true" />
            {t.accessibilitySettings.contrast}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard', label: t.accessibilitySettings.standard, desc: 'Default' },
              { id: 'high-contrast', label: t.accessibilitySettings.highContrast, desc: 'WCAG AAA' },
              { id: 'dark', label: t.accessibilitySettings.dark, desc: 'Night' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id as AccessibilityTheme)}
                aria-pressed={theme === opt.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  theme === opt.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold dark:bg-blue-950 dark:text-blue-100 dark:border-blue-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-sm">{opt.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Sizing */}
        <div className="mb-6">
          <label className="flex items-center gap-2 font-semibold text-sm mb-3">
            <Type className="w-4 h-4 text-blue-600" aria-hidden="true" />
            {t.accessibilitySettings.fontSize}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: t.accessibilitySettings.normal },
              { id: 'large', label: t.accessibilitySettings.large },
              { id: 'extra-large', label: t.accessibilitySettings.extraLarge }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFontSize(opt.id as FontSize)}
                aria-pressed={fontSize === opt.id}
                className={`p-3 rounded-xl border text-sm text-center transition-all ${
                  fontSize === opt.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold dark:bg-blue-950 dark:text-blue-100 dark:border-blue-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dyslexia Typography Toggle */}
        <div className="mb-6 flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="font-semibold text-sm">{t.accessibilitySettings.dyslexiaFont}</div>
            <div className="text-xs text-slate-500">Enhanced character distinction & letter spacing</div>
          </div>
          <button
            role="switch"
            aria-checked={dyslexiaFont}
            onClick={() => setDyslexiaFont(!dyslexiaFont)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              dyslexiaFont ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
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
            <label htmlFor="speech-rate-slider" className="flex items-center gap-2 font-semibold text-sm">
              <Volume2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
              {t.accessibilitySettings.speechRate}
            </label>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{speechRate}x</span>
          </div>
          <input
            id="speech-rate-slider"
            type="range"
            min="0.75"
            max="1.5"
            step="0.25"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0.75x (Slower)</span>
            <span>1.0x (Normal)</span>
            <span>1.5x (Faster)</span>
          </div>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="mb-6 flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="font-semibold text-sm">{t.accessibilitySettings.reducedMotion}</div>
            <div className="text-xs text-slate-500">Minimizes animations and transitions</div>
          </div>
          <button
            role="switch"
            aria-checked={reducedMotion}
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              reducedMotion ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
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
          className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Done
        </button>
      </div>
    </div>
  );
};
