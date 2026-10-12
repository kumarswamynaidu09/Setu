import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { BridgeMotif } from './BridgeMotif';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import {
  LogIn,
  LogOut,
  Radio,
  BookOpen,
  Building2,
  Menu,
  X,
  Users
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTeacher = isAuthenticated && user?.role === 'teacher';
  const isCoordinator = isAuthenticated && user?.role === 'coordinator';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 text-left rounded-lg p-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D7377]"
              aria-label="SETU Home"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] flex items-center justify-center text-[#0D7377] border border-[#BCE3DC]">
                <BridgeMotif size="md" variant="teal" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    SETU
                  </span>
                  <span className="badge-saffron text-[10px] hidden sm:inline-flex">
                    Swasth & Samavesh
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                  One Classroom. Many Ways to Learn.
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Role-Aware Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <button
              onClick={() => navigate('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                currentRoute === 'home'
                  ? 'bg-[#E6F4F1] text-[#0D7377]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigate('student-join')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                currentRoute === 'student-join'
                  ? 'bg-[#E6F4F1] text-[#0D7377]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Join Class
            </button>

            {isTeacher && (
              <>
                <button
                  onClick={() => navigate('teacher-dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentRoute === 'teacher-dashboard'
                      ? 'bg-[#E6F4F1] text-[#0D7377]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Teacher Workspace
                </button>
                <button
                  onClick={() => navigate('classes')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentRoute === 'classes'
                      ? 'bg-[#E6F4F1] text-[#0D7377]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Classes & Lessons
                </button>
              </>
            )}

            {isCoordinator && (
              <button
                onClick={() => navigate('coordinator')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  currentRoute === 'coordinator'
                    ? 'bg-[#E6F4F1] text-[#0D7377]'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#0D7377]" />
                <span>Coordinator Portal</span>
              </button>
            )}

            <button
              onClick={() => navigate('about')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                currentRoute === 'about'
                  ? 'bg-[#E6F4F1] text-[#0D7377]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              About
            </button>
          </nav>

          {/* Right Header Utilities: Accessibility Toolbar + Auth */}
          <div className="flex items-center gap-2.5">
            <AccessibilityToolbar />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 hidden lg:inline-block">
                  {user?.full_name}
                </span>
                <button
                  onClick={() => {
                    logout();
                    navigate('home');
                  }}
                  className="btn-civic-secondary text-xs py-1.5 px-2.5 rounded-lg"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('login')}
                className="btn-civic-primary text-xs py-1.5 px-3 rounded-lg"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Teacher Sign In</span>
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-900 hover:bg-slate-100"
          >
            Home
          </button>
          <button
            onClick={() => { navigate('student-join'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-[#0D7377] hover:bg-slate-100"
          >
            Join Live Class
          </button>
          {isTeacher && (
            <>
              <button
                onClick={() => { navigate('teacher-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-900 hover:bg-slate-100"
              >
                Teacher Workspace
              </button>
              <button
                onClick={() => { navigate('classes'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-900 hover:bg-slate-100"
              >
                Classes & Lessons
              </button>
            </>
          )}
          {isCoordinator && (
            <button
              onClick={() => { navigate('coordinator'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-900 hover:bg-slate-100"
            >
              Coordinator Portal
            </button>
          )}
          <button
            onClick={() => { navigate('about'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
          >
            About Initiative
          </button>
        </div>
      )}
    </header>
  );
};
