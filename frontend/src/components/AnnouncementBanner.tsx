import React from 'react';
import { Announcement } from '../types';
import { Megaphone, Volume2, X, AlertTriangle, Calendar, FileText } from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface AnnouncementBannerProps {
  announcement: Announcement;
  onDismiss?: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement, onDismiss }) => {
  const { speak, isSpeaking, cancel } = useSpeechSynthesis();

  const handleReadAloud = () => {
    if (isSpeaking) {
      cancel();
    } else {
      speak(`Teacher announcement. ${announcement.category}. ${announcement.title}. ${announcement.content}`);
    }
  };

  const isUrgent = announcement.priority === 'urgent' || announcement.category === 'Safety' || announcement.category === 'Exam';

  const getCategoryIcon = () => {
    switch (announcement.category) {
      case 'Exam':
        return <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Assignment':
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Safety':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Megaphone className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    }
  };

  return (
    <div
      role="region"
      aria-label="Teacher Announcement"
      className={`rounded-2xl p-4 mb-4 border transition-all shadow-sm ${
        isUrgent
          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
          : 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs shrink-0">
            {getCategoryIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {announcement.category}
              </span>
              <h4 className="font-bold text-base leading-tight">
                {announcement.title}
              </h4>
            </div>
            <p className="text-sm mt-1 leading-relaxed opacity-90">
              {announcement.content}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleReadAloud}
            aria-label={isSpeaking ? "Stop reading announcement" : "Listen to announcement"}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors"
            title="Read Aloud"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-blue-600 animate-pulse' : ''}`} />
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss announcement banner"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
