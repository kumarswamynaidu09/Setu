import React from 'react';
import { BridgeMotif } from './BridgeMotif';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'mint' | 'navy' | 'saffron';
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'mint',
  children
}) => {
  const badgeClasses = {
    mint: 'badge-mint',
    navy: 'badge-navy',
    saffron: 'badge-saffron'
  }[badgeVariant];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#D8E2DC] dark:border-[#25435E]">
      <div className="space-y-1.5">
        {badgeText && (
          <div className="flex items-center gap-2 mb-2">
            <BridgeMotif size="sm" variant={badgeVariant === 'saffron' ? 'saffron' : 'teal'} />
            <span className={badgeClasses}>{badgeText}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
};
