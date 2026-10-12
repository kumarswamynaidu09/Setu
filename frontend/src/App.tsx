import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { LiveClassroomProvider } from './context/LiveClassroomContext';

import { AppShell } from './components/AppShell';
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
    <AppShell currentRoute={currentRoute} navigate={navigate}>
      <Navbar currentRoute={currentRoute} navigate={navigate} />

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
    </AppShell>
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
