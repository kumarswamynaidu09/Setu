import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityModal } from './AccessibilityModal';
import { AppLanguage } from '../types';
import {
  Sparkles,
  Sliders,
  Globe,
  User as UserIcon,
  LogOut,
  LogIn,
  BookOpen,
  Radio,
  Building2,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useAccessibility();
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Product Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('home')}
                className="flex items-center gap-2.5 text-left focus-visible:ring-2 rounded-lg p-1"
                aria-label="SETU - Home"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-700 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                  स
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                      SETU
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      SevaFirst 2026
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:block leading-none">
                    {t.tagline}
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {isAuthenticated && user?.role === 'teacher' && (
                <>
                  <button
                    onClick={() => navigate('teacher-dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      currentRoute === 'teacher-dashboard'
                        ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t.nav.dashboard}
                  </button>
                  <button
                    onClick={() => navigate('classes')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      currentRoute === 'classes'
                        ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t.nav.classes}
                  </button>
                  <button
                    onClick={() => navigate('lessons')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      currentRoute === 'lessons'
                        ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t.nav.lessons}
                  </button>
                </>
              )}

              {isAuthenticated && user?.role === 'coordinator' && (
                <button
                  onClick={() => navigate('coordinator')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentRoute === 'coordinator'
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {t.nav.coordinator}
                  </span>
                </button>
              )}

              <button
                onClick={() => navigate('about')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentRoute === 'about'
                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.nav.about}
              </button>

              <button
                onClick={() => navigate('accessibility')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentRoute === 'accessibility'
                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.nav.accessibility}
              </button>
            </nav>

            {/* Utility Controls (Language, Accessibility Modal, User) */}
            <div className="flex items-center gap-2">
              
              {/* Language Switcher */}
              <div className="relative flex items-center">
                <label htmlFor="language-select" className="sr-only">
                  Select Language
                </label>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <Globe className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                    className="bg-transparent border-none focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="te">తెలుగు</option>
                  </select>
                </div>
              </div>

              {/* Accessibility Preferences Trigger */}
              <button
                onClick={() => setIsA11yModalOpen(true)}
                aria-label="Open accessibility display and speech settings"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900 font-semibold text-xs border border-blue-200 dark:border-blue-800 focus-visible:ring-2"
              >
                <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Preferences</span>
              </button>

              {/* Student Quick Join Button */}
              <button
                onClick={() => navigate('student-join')}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{t.nav.join}</span>
              </button>

              {/* Auth Button */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      logout();
                      navigate('home');
                    }}
                    title="Sign Out"
                    aria-label="Sign Out"
                    className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('login')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.nav.login}</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
            <button
              onClick={() => { navigate('home'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.nav.home}
            </button>
            {isAuthenticated && user?.role === 'teacher' && (
              <>
                <button
                  onClick={() => { navigate('teacher-dashboard'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.nav.dashboard}
                </button>
                <button
                  onClick={() => { navigate('classes'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.nav.classes}
                </button>
                <button
                  onClick={() => { navigate('lessons'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.nav.lessons}
                </button>
              </>
            )}
            {isAuthenticated && user?.role === 'coordinator' && (
              <button
                onClick={() => { navigate('coordinator'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.nav.coordinator}
              </button>
            )}
            <button
              onClick={() => { navigate('about'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.nav.about}
            </button>
            <button
              onClick={() => { navigate('accessibility'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.nav.accessibility}
            </button>
            <button
              onClick={() => { navigate('privacy'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.nav.privacy}
            </button>
          </div>
        )}
      </header>

      <AccessibilityModal
        isOpen={isA11yModalOpen}
        onClose={() => setIsA11yModalOpen(false)}
      />
    </>
  );
};
