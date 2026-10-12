import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import {
  LogIn,
  LogOut,
  Radio,
  BookOpen,
  Building2,
  Menu,
  X,
  User,
  Sliders
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

/**
 * Clean, minimalistic Apple / iOS-style navigation bar.
 * No visual clutter, no bloated pills or redundant badges.
 */
export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTeacher = isAuthenticated && user?.role === 'teacher';
  const isCoordinator = isAuthenticated && user?.role === 'coordinator';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/5 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo — Clean Apple minimal style */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 group text-left"
              aria-label="SETU Home"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 font-bold text-sm">
                S
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  SETU
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Classroom
                </span>
              </div>
            </button>
          </div>

          {/* Clean Segmented Navigation Links */}
          <nav className="hidden md:flex items-center p-1 bg-black/[0.04] rounded-full" aria-label="Main Navigation">
            <button
              onClick={() => navigate('home')}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                currentRoute === 'home'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => navigate('student-join')}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                currentRoute === 'student-join'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Join Class
            </button>

            {isTeacher && (
              <>
                <button
                  onClick={() => navigate('teacher-dashboard')}
                  className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentRoute === 'teacher-dashboard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Workspace
                </button>
                <button
                  onClick={() => navigate('classes')}
                  className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentRoute === 'classes'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lessons
                </button>
              </>
            )}

            {isCoordinator && (
              <button
                onClick={() => navigate('coordinator')}
                className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                  currentRoute === 'coordinator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Coordinator
              </button>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2">
            <AccessibilityToolbar />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 hidden lg:inline">
                  {user?.full_name?.split(' ')[0]}
                </span>
                <button
                  onClick={() => {
                    logout();
                    navigate('home');
                  }}
                  className="p-1.5 rounded-full hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('login')}
                className="btn-ios-primary text-xs py-1.5 px-3.5"
              >
                <span>Teacher Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-700 rounded-lg hover:bg-black/5"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1">
          <button
            onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-900 rounded-xl hover:bg-black/5"
          >
            Overview
          </button>
          <button
            onClick={() => { navigate('student-join'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-600 rounded-xl hover:bg-blue-50"
          >
            Join Class
          </button>
          {isTeacher && (
            <>
              <button
                onClick={() => { navigate('teacher-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-900 rounded-xl hover:bg-black/5"
              >
                Teacher Workspace
              </button>
              <button
                onClick={() => { navigate('classes'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-900 rounded-xl hover:bg-black/5"
              >
                Classes & Lessons
              </button>
            </>
          )}
          {isCoordinator && (
            <button
              onClick={() => { navigate('coordinator'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-900 rounded-xl hover:bg-black/5"
            >
              Coordinator
            </button>
          )}
        </div>
      )}
    </header>
  );
};
