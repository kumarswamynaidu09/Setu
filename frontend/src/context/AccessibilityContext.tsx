import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilityTheme, FontSize, AppLanguage } from '../types';
import { translations } from '../i18n/translations';

interface AccessibilityContextType {
  theme: AccessibilityTheme;
  setTheme: (theme: AccessibilityTheme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (enabled: boolean) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: typeof translations.en;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to clean light standard mode
  const [theme, setTheme] = useState<AccessibilityTheme>('standard');

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('setu_pref_font_size') as FontSize) || 'normal';
  });

  const [dyslexiaFont, setDyslexiaFont] = useState<boolean>(() => {
    return localStorage.getItem('setu_pref_dyslexia') === 'true';
  });

  const [speechRate, setSpeechRate] = useState<number>(() => {
    const stored = localStorage.getItem('setu_pref_speech_rate');
    return stored ? parseFloat(stored) : 1.0;
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('setu_pref_reduced_motion') === 'true';
  });

  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem('setu_pref_lang') as AppLanguage) || 'en';
  });

  useEffect(() => {
    // Keep document element clean light
    document.documentElement.classList.remove('theme-high-contrast', 'theme-dark');
    document.body.removeAttribute('data-theme');
  }, []);

  useEffect(() => {
    localStorage.setItem('setu_pref_font_size', fontSize);
    if (fontSize === 'large') {
      document.documentElement.style.fontSize = '18px';
    } else if (fontSize === 'extra-large') {
      document.documentElement.style.fontSize = '20px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('setu_pref_dyslexia', String(dyslexiaFont));
    if (dyslexiaFont) {
      document.body.classList.add('font-dyslexia');
    } else {
      document.body.classList.remove('font-dyslexia');
    }
  }, [dyslexiaFont]);

  useEffect(() => {
    localStorage.setItem('setu_pref_speech_rate', String(speechRate));
  }, [speechRate]);

  useEffect(() => {
    localStorage.setItem('setu_pref_reduced_motion', String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem('setu_pref_lang', language);
    document.body.setAttribute('data-lang', language);
  }, [language]);

  const currentTranslations = translations[language] || translations.en;

  return (
    <AccessibilityContext.Provider value={{
      theme, setTheme,
      fontSize, setFontSize,
      dyslexiaFont, setDyslexiaFont,
      speechRate, setSpeechRate,
      reducedMotion, setReducedMotion,
      language, setLanguage,
      t: currentTranslations
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
