import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PrimaryActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  onClick: () => void;
  accentVariant?: 'teal' | 'navy' | 'saffron';
  badge?: string;
}

export const PrimaryActionCard: React.FC<PrimaryActionCardProps> = ({
  title,
  description,
  icon,
  actionText,
  onClick,
  accentVariant = 'teal',
  badge
}) => {
  const accentBorder = {
    teal: 'hover:border-[#0A625D] dark:hover:border-[#12948C]',
    navy: 'hover:border-[#19324A] dark:hover:border-[#4B739B]',
    saffron: 'hover:border-[#B07822] dark:hover:border-[#DCA248]'
  }[accentVariant];

  const iconBg = {
    teal: 'bg-[#E8F5F2] text-[#0A625D] dark:bg-[#0A625D]/30 dark:text-[#E8F5F2]',
    navy: 'bg-[#EBF2F7] text-[#19324A] dark:bg-[#19324A]/50 dark:text-[#E8F5F2]',
    saffron: 'bg-[#FEF7EE] text-[#8C5E16] dark:bg-[#B07822]/20 dark:text-[#F6D8A8]'
  }[accentVariant];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`civic-card p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md ${accentBorder} group focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#0A625D]`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-xs ${iconBg}`}>
            {icon}
          </div>
          {badge && (
            <span className="badge-saffron text-[11px]">
              {badge}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-[#19324A] dark:text-white mb-2 group-hover:text-[#0A625D] dark:group-hover:text-teal-300 transition-colors">
          {title}
        </h2>
        <p className="text-sm text-[#526575] dark:text-[#9BB0C1] leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#E6ECE8] dark:border-[#1F364C] flex items-center justify-between text-sm font-semibold text-[#0A625D] dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
        <span>{actionText}</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
};
