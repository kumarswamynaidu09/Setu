import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import {
  LogOut,
  Menu,
  X,
  User,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

/**
 * Clean minimal nav — only logo + contextual actions.
 * No clutter, just what's needed for the current state.
 */
export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTeacher = isAuthenticated && (user?.role === 'teacher' || user?.role === 'coordinator' || user?.role === 'admin');
  const isStudent = isAuthenticated && (user?.role === 'student' || user?.role === 'adult_learner');

  // Hide navbar on landing page for clean hero experience
  const isLanding = currentRoute === 'home';

  return (
    <header className={`sticky top-0 z-30 transition-all ${
      isLanding 
        ? 'bg-transparent' 
        : 'bg-white/80 backdrop-blur-xl border-b border-black/[0.04]'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 group"
            aria-label="SETU Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B4A] to-[#FF9A8B] flex items-center justify-center text-white shadow-sm font-bold text-sm">
              S
            </div>
            <span className="font-bold text-lg text-[#1A1A2E] tracking-tight">
              SETU
            </span>
          </button>

          {/* Right Actions — Context-aware, minimal */}
          <div className="flex items-center gap-2">
            <AccessibilityToolbar />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Dashboard link */}
                <button
                  onClick={() => navigate(isTeacher ? 'teacher-dashboard' : 'dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#6B7280] hover:text-[#1A1A2E] hover:bg-black/[0.04] transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user?.full_name?.split(' ')[0]}</span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => navigate('profile-setup')}
                  className="p-2 rounded-full hover:bg-black/[0.04] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
                  aria-label="Settings"
                  title="Accessibility & Profile Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Sign out */}
                <button
                  onClick={() => {
                    logout();
                    navigate('home');
                  }}
                  className="p-2 rounded-full hover:bg-black/[0.04] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('login')}
                  className="text-xs font-semibold text-[#6B7280] hover:text-[#1A1A2E] px-3 py-1.5 rounded-full hover:bg-black/[0.04] transition-all hidden sm:block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('signup')}
                  className="btn-ios-primary text-xs py-2 px-4"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-[#6B7280] rounded-xl hover:bg-black/[0.04]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-black/[0.04] bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1">
          <button
            onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1A2E] rounded-xl hover:bg-black/[0.04]"
          >
            Home
          </button>

          {!isAuthenticated && (
            <>
              <button
                onClick={() => { navigate('signup'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-semibold text-[#FF6B4A] rounded-xl hover:bg-[#FFF0EC]"
              >
                Get Started
              </button>
              <button
                onClick={() => { navigate('login'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#6B7280] rounded-xl hover:bg-black/[0.04]"
              >
                Sign In
              </button>
            </>
          )}

          {isAuthenticated && (
            <>
              <button
                onClick={() => { navigate(isTeacher ? 'teacher-dashboard' : 'dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1A2E] rounded-xl hover:bg-black/[0.04]"
              >
                Dashboard
              </button>
              <button
                onClick={() => { navigate('student-join'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1A2E] rounded-xl hover:bg-black/[0.04]"
              >
                Join Classroom
              </button>
              {isTeacher && (
                <button
                  onClick={() => { navigate('classes'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1A2E] rounded-xl hover:bg-black/[0.04]"
                >
                  My Classes
                </button>
              )}
              <button
                onClick={() => { navigate('profile-setup'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#6B7280] rounded-xl hover:bg-black/[0.04]"
              >
                Profile & Accessibility
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
