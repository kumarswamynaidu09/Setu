import React from 'react';
import { BridgeMotif } from './BridgeMotif';

interface AppShellProps {
  children: React.ReactNode;
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, currentRoute, navigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F8] dark:bg-[#0E1B26] text-[#142332] dark:text-[#F0F6F5] transition-colors">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {children}
      </main>

      {/* Institutional Civic Footer */}
      <footer className="border-t border-[#D8E2DC] dark:border-[#25435E] bg-white dark:bg-[#142738] py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#526575] dark:text-[#9BB0C1]">
          <div className="flex items-center gap-3 text-center md:text-left">
            <BridgeMotif size="md" variant="teal" />
            <div>
              <div className="font-bold text-[#19324A] dark:text-white flex items-center gap-2">
                <span>SETU</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5F2] text-[#0A625D] font-semibold">
                  Civic Public Service
                </span>
              </div>
              <div className="text-xs mt-0.5">
                Learning without barriers • SevaFirst Innovation Challenge 2026 (Swasth & Samavesh Bharat)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-wrap justify-center text-xs font-semibold">
            <button
              onClick={() => navigate('about')}
              className="text-[#19324A] dark:text-slate-200 hover:text-[#0A625D] underline-offset-4 hover:underline"
            >
              About the Initiative
            </button>
            <button
              onClick={() => navigate('accessibility')}
              className="text-[#19324A] dark:text-slate-200 hover:text-[#0A625D] underline-offset-4 hover:underline"
            >
              WCAG 2.2 AA Conformance
            </button>
            <button
              onClick={() => navigate('privacy')}
              className="text-[#19324A] dark:text-slate-200 hover:text-[#0A625D] underline-offset-4 hover:underline"
            >
              Child Privacy & Ethics
            </button>
            <button
              onClick={() => navigate('student-join')}
              className="text-[#0A625D] dark:text-teal-400 font-bold hover:underline"
            >
              Join Classroom
            </button>
            <button
              onClick={() => navigate('login')}
              className="text-[#19324A] dark:text-slate-200 hover:text-[#0A625D] hover:underline"
            >
              Teacher Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
