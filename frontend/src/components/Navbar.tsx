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

  // Role-aware navigation links
  const isTeacher = isAuthenticated && user?.role === 'teacher';
  const isCoordinator = isAuthenticated && user?.role === 'coordinator';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#142738]/95 backdrop-blur-md border-b border-[#D8E2DC] dark:border-[#25435E] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 text-left rounded-lg p-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A625D]"
              aria-label="SETU Home"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] dark:bg-[#0A625D]/30 flex items-center justify-center text-[#0A625D] dark:text-[#E8F5F2] border border-[#BFE5DC] dark:border-[#0A625D]">
                <BridgeMotif size="md" variant="teal" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-[#19324A] dark:text-white">
                    SETU
                  </span>
                  <span className="badge-saffron text-[10px] hidden sm:inline-flex">
                    Swasth & Samavesh
                  </span>
                </div>
                <p className="text-[11px] text-[#526575] dark:text-[#9BB0C1] font-medium hidden md:block">
                  Learning without barriers
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Role-Aware Navigation */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {/* Student Navigation */}
            <button
              onClick={() => navigate('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                currentRoute === 'home'
                  ? 'bg-[#E8F5F2] text-[#0A625D] dark:bg-[#0A625D]/30 dark:text-teal-200'
                  : 'text-[#19324A] dark:text-[#F0F6F5] hover:bg-[#F7F9F8] dark:hover:bg-[#19324A]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigate('student-join')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                currentRoute === 'student-join'
                  ? 'bg-[#E8F5F2] text-[#0A625D] dark:bg-[#0A625D]/30 dark:text-teal-200'
                  : 'text-[#19324A] dark:text-[#F0F6F5] hover:bg-[#F7F9F8] dark:hover:bg-[#19324A]'
              }`}
            >
              Join Class
            </button>

            {/* Teacher Navigation */}
            {isTeacher && (
              <>
                <button
                  onClick={() => navigate('teacher-dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentRoute === 'teacher-dashboard'
                      ? 'bg-[#E8F5F2] text-[#0A625D] dark:bg-[#0A625D]/30 dark:text-teal-200'
                      : 'text-[#19324A] dark:text-[#F0F6F5] hover:bg-[#F7F9F8] dark:hover:bg-[#19324A]'
                  }`}
                >
                  Teacher Workspace
                </button>
                <button
                  onClick={() => navigate('classes')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentRoute === 'classes'
                      ? 'bg-[#E8F5F2] text-[#0A625D] dark:bg-[#0A625D]/30 dark:text-teal-200'
                      : 'text-[#19324A] dark:text-[#F0F6F5] hover:bg-[#F7F9F8] dark:hover:bg-[#19324A]'
                  }`}
                >
                  Classes & Lessons
                </button>
              </>
            )}

            {/* Coordinator Navigation */}
            {isCoordinator && (
              <button
                onClick={() => navigate('coordinator')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  currentRoute === 'coordinator'
                    ? 'bg-[#E8F5F2] text-[#0A625D] dark:bg-[#0A625D]/30 dark:text-teal-200'
                    : 'text-[#19324A] dark:text-[#F0F6F5] hover:bg-[#F7F9F8] dark:hover:bg-[#19324A]'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#0A625D]" />
                <span>Coordinator Portal</span>
              </button>
            )}

            {/* Institutional Information */}
            <button
              onClick={() => navigate('about')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                currentRoute === 'about'
                  ? 'bg-[#E8F5F2] text-[#0A625D] dark:bg-[#0A625D]/30 dark:text-teal-200'
                  : 'text-[#526575] dark:text-[#9BB0C1] hover:text-[#19324A] dark:hover:text-white'
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
                <span className="text-xs font-semibold text-[#526575] dark:text-[#9BB0C1] hidden lg:inline-block">
                  {user?.full_name} ({user?.role})
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
                  <LogOut className="w-3.5 h-3.5 text-[#526575]" />
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
              className="md:hidden p-2 text-[#19324A] dark:text-white rounded-lg hover:bg-[#F7F9F8] dark:hover:bg-[#19324A]"
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
        <div className="md:hidden border-t border-[#D8E2DC] dark:border-[#25435E] bg-white dark:bg-[#142738] px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => {
              navigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-[#19324A] dark:text-white hover:bg-[#E8F5F2]"
          >
            Home
          </button>
          <button
            onClick={() => {
              navigate('student-join');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-[#0A625D] hover:bg-[#E8F5F2]"
          >
            Join Live Class
          </button>
          {isTeacher && (
            <>
              <button
                onClick={() => {
                  navigate('teacher-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-semibold text-[#19324A] dark:text-white hover:bg-[#E8F5F2]"
              >
                Teacher Workspace
              </button>
              <button
                onClick={() => {
                  navigate('classes');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-semibold text-[#19324A] dark:text-white hover:bg-[#E8F5F2]"
              >
                Classes & Lessons
              </button>
            </>
          )}
          {isCoordinator && (
            <button
              onClick={() => {
                navigate('coordinator');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-semibold text-[#19324A] dark:text-white hover:bg-[#E8F5F2]"
            >
              Coordinator Portal
            </button>
          )}
          <button
            onClick={() => {
              navigate('about');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-[#526575] hover:bg-[#E8F5F2]"
          >
            About Initiative
          </button>
          <button
            onClick={() => {
              navigate('accessibility');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-[#526575] hover:bg-[#E8F5F2]"
          >
            WCAG 2.2 AA Statement
          </button>
          <button
            onClick={() => {
              navigate('privacy');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-[#526575] hover:bg-[#E8F5F2]"
          >
            Child Privacy
          </button>
        </div>
      )}
    </header>
  );
};
