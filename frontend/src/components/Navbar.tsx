import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityModal } from './AccessibilityModal';
import { AppLanguage } from '../types';
import {
  Sliders,
  Globe,
  LogOut,
  LogIn,
  Radio,
  Building2,
  Menu,
  X,
  Circle
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

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Nothing-Style Identity */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('home')}
                className="flex items-center gap-2.5 text-left focus-visible:ring-2 rounded-xl p-1 group"
                aria-label="SETU - Home"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-mono font-bold text-base shadow-xs group-hover:bg-red-600 dark:group-hover:bg-red-600 dark:group-hover:text-white transition-colors">
                  (S)
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg tracking-tight font-heading text-zinc-900 dark:text-white">
                      SETU
                    </span>
                    <span className="nothing-label text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      v1.0 // 2026
                    </span>
                  </div>
                  <p className="nothing-label text-[10px] text-zinc-400 dark:text-zinc-500 hidden md:block leading-none mt-0.5">
                    ONE CLASSROOM. MANY WAYS TO LEARN.
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      currentRoute === 'teacher-dashboard'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    ( DASHBOARD )
                  </button>
                  <button
                    onClick={() => navigate('classes')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      currentRoute === 'classes'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    CLASSES
                  </button>
                  <button
                    onClick={() => navigate('lessons')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      currentRoute === 'lessons'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    LESSONS
                  </button>
                </>
              )}

              {isAuthenticated && user?.role === 'coordinator' && (
                <button
                  onClick={() => navigate('coordinator')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    currentRoute === 'coordinator'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    COORDINATOR
                  </span>
                </button>
              )}

              <button
                onClick={() => navigate('about')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  currentRoute === 'about'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                ABOUT
              </button>

              <button
                onClick={() => navigate('accessibility')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  currentRoute === 'accessibility'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                A11Y
              </button>
            </nav>

            {/* Utility Controls (Language, Accessibility Modal, User) */}
            <div className="flex items-center gap-2">
              
              {/* Language Switcher */}
              <div className="relative flex items-center">
                <label htmlFor="language-select" className="sr-only">
                  Select Language
                </label>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-2.5 py-1 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  <Globe className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                    className="bg-transparent border-none focus:outline-none cursor-pointer pr-1 text-xs"
                  >
                    <option value="en">EN</option>
                    <option value="hi">हिन्दी</option>
                    <option value="te">తెలుగు</option>
                  </select>
                </div>
              </div>

              {/* Accessibility Preferences Trigger */}
              <button
                onClick={() => setIsA11yModalOpen(true)}
                aria-label="Open accessibility display and speech settings"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-mono font-bold text-xs border border-zinc-200 dark:border-zinc-800 focus-visible:ring-2"
              >
                <Sliders className="w-3 h-3 text-red-500" aria-hidden="true" />
                <span className="hidden sm:inline">PREFS</span>
              </button>

              {/* Student Quick Join Button with Crimson Red Dot */}
              <button
                onClick={() => navigate('student-join')}
                className="px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-red-600 dark:bg-zinc-100 dark:hover:bg-red-600 text-white dark:text-zinc-950 dark:hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 group-hover:bg-white animate-pulse" />
                <span>JOIN</span>
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
                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('login')}
                  className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-xs font-bold flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  <span className="hidden sm:inline">TEACHER</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-1 font-mono text-xs">
            <button
              onClick={() => { navigate('home'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              ( 01 ) HOME
            </button>
            {isAuthenticated && user?.role === 'teacher' && (
              <>
                <button
                  onClick={() => { navigate('teacher-dashboard'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ( 02 ) DASHBOARD
                </button>
                <button
                  onClick={() => { navigate('classes'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ( 03 ) CLASSES
                </button>
                <button
                  onClick={() => { navigate('lessons'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ( 04 ) LESSONS
                </button>
              </>
            )}
            {isAuthenticated && user?.role === 'coordinator' && (
              <button
                onClick={() => { navigate('coordinator'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ( 05 ) COORDINATOR
              </button>
            )}
            <button
              onClick={() => { navigate('about'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              ABOUT
            </button>
            <button
              onClick={() => { navigate('accessibility'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              ACCESSIBILITY
            </button>
            <button
              onClick={() => { navigate('privacy'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              PRIVACY
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
