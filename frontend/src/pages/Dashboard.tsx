import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ear,
  Eye,
  Hand,
  Brain,
  MessageSquare,
  Sparkles,
  GraduationCap,
  Briefcase,
  BookOpen,
  Radio,
  Users,
  Rocket,
  Settings,
  HelpCircle,
  Plus,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import type { DisabilityType, OnboardingRole } from './SignUpPage';

interface DashboardProps {
  navigate: (route: string) => void;
}

interface QuickAction {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  route: string;
}

const DISABILITY_META: Record<DisabilityType, { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string }> = {
  hearing: { label: 'Hearing Support', icon: Ear, bg: 'bg-[#FF6B4A]/10', text: 'text-[#FF6B4A]' },
  vision: { label: 'Vision Support', icon: Eye, bg: 'bg-[#4A90D9]/10', text: 'text-[#4A90D9]' },
  motor: { label: 'Motor Support', icon: Hand, bg: 'bg-[#2ECC71]/10', text: 'text-[#2ECC71]' },
  cognitive: { label: 'Cognitive Support', icon: Brain, bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' },
  speech: { label: 'Speech Support', icon: MessageSquare, bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
  none: { label: 'Universal Access', icon: Sparkles, bg: 'bg-[#0D9488]/10', text: 'text-[#0D9488]' }
};

export const Dashboard: React.FC<DashboardProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<OnboardingRole>('student');
  const [disabilities, setDisabilities] = useState<DisabilityType[]>(['hearing']);
  const [displayName, setDisplayName] = useState<string>('Learner');

  useEffect(() => {
    // Retrieve stored profile info
    const storedRole = (localStorage.getItem('setu_user_role') as OnboardingRole) || (user?.role === 'teacher' ? 'teacher' : 'student');
    setRole(storedRole);

    const storedName = user?.full_name || localStorage.getItem('setu_user_name') || 'Learner';
    setDisplayName(storedName);

    try {
      const storedDis = localStorage.getItem('setu_disability_profile');
      if (storedDis) {
        const parsed = JSON.parse(storedDis);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDisabilities(parsed);
          return;
        }
      }
    } catch {
      // default
    }
  }, [user]);

  const getRoleLabel = (r: OnboardingRole) => {
    switch (r) {
      case 'teacher':
        return { label: 'Teacher / Educator', icon: BookOpen, badgeClass: 'bg-[#2ECC71]/15 text-[#2ECC71]' };
      case 'adult_learner':
        return { label: 'Adult Learner', icon: Briefcase, badgeClass: 'bg-[#4A90D9]/15 text-[#4A90D9]' };
      case 'student':
      default:
        return { label: 'Student', icon: GraduationCap, badgeClass: 'bg-[#FF6B4A]/15 text-[#FF6B4A]' };
    }
  };

  const roleInfo = getRoleLabel(role);
  const RoleIcon = roleInfo.icon;

  const getQuickActions = (r: OnboardingRole): QuickAction[] => {
    if (r === 'teacher') {
      return [
        {
          title: 'Create Classroom',
          subtitle: 'Set up a new grade or subject',
          icon: Plus,
          iconBg: 'bg-[#FF6B4A]/10',
          iconColor: 'text-[#FF6B4A]',
          route: 'classes'
        },
        {
          title: 'My Classes',
          subtitle: 'View lessons & curriculum',
          icon: BookOpen,
          iconBg: 'bg-[#4A90D9]/10',
          iconColor: 'text-[#4A90D9]',
          route: 'teacher-dashboard'
        },
        {
          title: 'Start Live Session',
          subtitle: 'Broadcast with real-time STT',
          icon: Radio,
          iconBg: 'bg-[#2ECC71]/10',
          iconColor: 'text-[#2ECC71]',
          route: 'teacher-dashboard'
        },
        {
          title: 'Settings',
          subtitle: 'Manage profile & accessibility',
          icon: Settings,
          iconBg: 'bg-[#8B5CF6]/10',
          iconColor: 'text-[#8B5CF6]',
          route: 'profile-setup'
        }
      ];
    }

    if (r === 'adult_learner') {
      return [
        {
          title: 'Browse Courses',
          subtitle: 'Vocational & life-skill modules',
          icon: BookOpen,
          iconBg: 'bg-[#4A90D9]/10',
          iconColor: 'text-[#4A90D9]',
          route: 'student-join'
        },
        {
          title: 'My Progress',
          subtitle: 'Track completed units & badges',
          icon: Rocket,
          iconBg: 'bg-[#2ECC71]/10',
          iconColor: 'text-[#2ECC71]',
          route: 'student-join'
        },
        {
          title: 'Accessibility Settings',
          subtitle: 'Tune font, contrast & inputs',
          icon: Settings,
          iconBg: 'bg-[#FF6B4A]/10',
          iconColor: 'text-[#FF6B4A]',
          route: 'profile-setup'
        },
        {
          title: 'Community',
          subtitle: 'Peer exchange & study groups',
          icon: Users,
          iconBg: 'bg-[#F59E0B]/10',
          iconColor: 'text-[#F59E0B]',
          route: 'about'
        }
      ];
    }

    // Default: Student
    return [
      {
        title: 'Join Classroom',
        subtitle: 'Enter 6-digit teacher room code',
        icon: Radio,
        iconBg: 'bg-[#FF6B4A]/10',
        iconColor: 'text-[#FF6B4A]',
        route: 'student-join'
      },
      {
        title: 'My Lessons',
        subtitle: 'Read or listen to past lessons',
        icon: BookOpen,
        iconBg: 'bg-[#4A90D9]/10',
        iconColor: 'text-[#4A90D9]',
        route: 'student-join'
      },
      {
        title: 'Accessibility Settings',
        subtitle: 'Update your support preferences',
        icon: Settings,
        iconBg: 'bg-[#8B5CF6]/10',
        iconColor: 'text-[#8B5CF6]',
        route: 'profile-setup'
      },
      {
        title: 'Help',
        subtitle: 'Learn how to use assistive tools',
        icon: HelpCircle,
        iconBg: 'bg-[#2ECC71]/10',
        iconColor: 'text-[#2ECC71]',
        route: 'about'
      }
    ];
  };

  const quickActions = getQuickActions(role);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A2E] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header / Warm Greeting */}
        <header className="bg-white rounded-[1.25rem] p-6 sm:p-8 shadow-xs border border-black/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight flex items-center gap-2">
              <span>Welcome back, {displayName}</span>
              <span role="img" aria-label="Waving hand" className="inline-block animate-bounce text-2xl sm:text-3xl">
                👋
              </span>
            </h1>

            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roleInfo.badgeClass}`}
              >
                <RoleIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{roleInfo.label}</span>
              </span>
              <span className="text-xs text-[#6B7280]">
                • Active Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('profile-setup')}
              aria-label="Edit accessibility preferences"
              className="min-h-[44px] h-11 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1A1A2E] font-medium text-xs sm:text-sm transition-all inline-flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-[#6B7280]" aria-hidden="true" />
              <span>Accessibility Preferences</span>
            </button>
          </div>
        </header>

        {/* Quick Actions Grid (2x2 on mobile, 4 cols on desktop) */}
        <section aria-labelledby="quick-actions-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              id="quick-actions-heading"
              className="text-lg sm:text-xl font-bold text-[#1A1A2E] tracking-tight"
            >
              Quick Actions
            </h2>
            <span className="text-xs text-[#6B7280]">
              Personalized for {roleInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => navigate(action.route)}
                  aria-label={`${action.title}: ${action.subtitle}`}
                  className="bg-white rounded-[1.25rem] p-5 shadow-xs border border-black/[0.04] text-left hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between group min-h-[160px] cursor-pointer"
                >
                  <div className="space-y-3">
                    <div
                      className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-full ${action.iconBg} ${action.iconColor} flex items-center justify-center`}
                      aria-hidden="true"
                    >
                      <ActionIcon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#1A1A2E] group-hover:text-[#FF6B4A] transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] line-clamp-2 mt-0.5 leading-snug">
                        {action.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center text-xs font-semibold text-[#FF6B4A] gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Bottom: Accessibility Profile Section */}
        <section
          aria-labelledby="accessibility-profile-heading"
          className="bg-white rounded-[1.25rem] p-6 sm:p-7 shadow-xs border border-black/[0.04] space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2
                id="accessibility-profile-heading"
                className="text-base sm:text-lg font-bold text-[#1A1A2E]"
              >
                Your Accessibility Profile
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280]">
                Features automatically customized to your active sensory & motor preferences.
              </p>
            </div>

            <button
              onClick={() => navigate('profile-setup')}
              aria-label="Edit your accessibility profile"
              className="min-h-[44px] h-10 px-4 rounded-full bg-[#FF6B4A]/10 hover:bg-[#FF6B4A]/20 text-[#FF6B4A] font-semibold text-xs sm:text-sm transition-all inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {disabilities.length === 0 ? (
              <span className="text-xs text-[#6B7280]">No preferences saved yet.</span>
            ) : (
              disabilities.map((dis) => {
                const meta = DISABILITY_META[dis] || {
                  label: dis,
                  icon: Sparkles,
                  bg: 'bg-slate-100',
                  text: 'text-slate-700'
                };
                const DisIcon = meta.icon;

                return (
                  <div
                    key={dis}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold ${meta.bg} ${meta.text} border border-black/[0.04]`}
                  >
                    <DisIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{meta.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
