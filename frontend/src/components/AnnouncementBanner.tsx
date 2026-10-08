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
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'Assignment':
        return <FileText className="w-4 h-4 text-zinc-400" />;
      case 'Safety':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Megaphone className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div
      role="region"
      aria-label="Teacher Announcement"
      className={`rounded-2xl p-4 mb-4 border transition-all shadow-xs backdrop-blur-xs ${
        isUrgent
          ? 'bg-zinc-900 text-white dark:bg-zinc-900 border-red-500/80'
          : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full shrink-0">
            {getCategoryIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="nothing-label text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700">
                [ {announcement.category} ]
              </span>
              <h4 className="font-bold text-sm sm:text-base font-heading">
                {announcement.title}
              </h4>
            </div>
            <p className="text-xs sm:text-sm mt-1 leading-relaxed opacity-90 font-normal">
              {announcement.content}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleReadAloud}
            aria-label={isSpeaking ? "Stop reading announcement" : "Listen to announcement"}
            className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
            title="Read Aloud"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-red-500 animate-pulse' : ''}`} />
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss announcement banner"
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
