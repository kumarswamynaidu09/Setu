import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { LiveClassroomProvider } from './context/LiveClassroomContext';

import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LoginPage } from './pages/LoginPage';
import { StudentJoinPage } from './pages/StudentJoinPage';
import { StudentSessionView } from './pages/StudentSessionView';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ClassManagement } from './pages/ClassManagement';
import { LessonEditor } from './pages/LessonEditor';
import { TeacherLiveClassroom } from './pages/TeacherLiveClassroom';
import { CoordinatorPortal } from './pages/CoordinatorPortal';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [routeData, setRouteData] = useState<any>(null);
  const [prefilledCode, setPrefilledCode] = useState<string>('');

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash.startsWith('join')) {
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        const code = urlParams.get('code') || '';
        setPrefilledCode(code);
        setCurrentRoute('student-join');
      } else {
        setCurrentRoute(hash);
      }
      window.scrollTo(0, 0);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string, data?: any) => {
    setRouteData(data);
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar currentRoute={currentRoute} navigate={navigate} />

      <main id="main-content" className="flex-1">
        {currentRoute === 'home' && <LandingPage navigate={navigate} />}
        {currentRoute === 'about' && <AboutPage />}
        {currentRoute === 'accessibility' && <AccessibilityPage />}
        {currentRoute === 'privacy' && <PrivacyPage />}
        {currentRoute === 'login' && <LoginPage navigate={navigate} />}
        {currentRoute === 'student-join' && (
          <StudentJoinPage navigate={navigate} prefilledCode={prefilledCode} />
        )}
        {currentRoute === 'student-session' && (
          <StudentSessionView navigate={navigate} sessionData={routeData?.sessionData} />
        )}
        {currentRoute === 'teacher-dashboard' && (
          <TeacherDashboard navigate={navigate} />
        )}
        {currentRoute === 'classes' && (
          <ClassManagement navigate={navigate} />
        )}
        {currentRoute === 'lessons' && (
          <TeacherDashboard navigate={navigate} />
        )}
        {currentRoute === 'lesson-editor' && (
          <LessonEditor
            navigate={navigate}
            initialLesson={routeData?.lesson}
            initialClassId={routeData?.classId}
          />
        )}
        {currentRoute === 'teacher-live' && (
          <TeacherLiveClassroom
            navigate={navigate}
            sessionData={routeData?.session}
          />
        )}
        {currentRoute === 'coordinator' && (
          <CoordinatorPortal />
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <div>
            <span className="font-extrabold text-slate-800 dark:text-white">SETU</span> — One Classroom. Many Ways to Learn.
            <div className="text-[11px] text-slate-400 mt-0.5">
              SevaFirst Innovation Challenge 2026 • Theme 03: Swasth & Samavesh Bharat
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center font-semibold">
            <button onClick={() => navigate('about')} className="hover:underline">About</button>
            <button onClick={() => navigate('accessibility')} className="hover:underline">WCAG 2.2 Statement</button>
            <button onClick={() => navigate('privacy')} className="hover:underline">Child Privacy</button>
            <button onClick={() => navigate('login')} className="hover:underline">Teacher Portal</button>
            <button onClick={() => navigate('student-join')} className="hover:underline text-teal-600 dark:text-teal-400">Join Classroom</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <LiveClassroomProvider>
          <AppContent />
        </LiveClassroomProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
