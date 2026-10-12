import React from 'react';

interface StatusIndicatorProps {
  status: 'connected' | 'reconnecting' | 'disconnected' | 'listening' | 'idle' | 'error';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md'
}) => {
  const statusConfig = {
    connected: {
      color: 'bg-[#0A625D]',
      ring: 'border-[#0A625D]',
      text: 'Connected',
      pulse: true
    },
    listening: {
      color: 'bg-[#B07822]',
      ring: 'border-[#B07822]',
      text: 'Listening',
      pulse: true
    },
    reconnecting: {
      color: 'bg-[#DCA248]',
      ring: 'border-[#DCA248]',
      text: 'Reconnecting...',
      pulse: true
    },
    disconnected: {
      color: 'bg-[#526575]',
      ring: 'border-[#526575]',
      text: 'Disconnected',
      pulse: false
    },
    idle: {
      color: 'bg-[#526575]',
      ring: 'border-[#526575]',
      text: 'Standby',
      pulse: false
    },
    error: {
      color: 'bg-[#C53030]',
      ring: 'border-[#C53030]',
      text: 'Error',
      pulse: false
    }
  }[status];

  const sizeClasses = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#19324A] dark:text-[#F0F6F5]">
      <span className="relative flex h-2.5 w-2.5">
        {statusConfig.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full ${sizeClasses} ${statusConfig.color}`} />
      </span>
      <span>{label || statusConfig.text}</span>
    </div>
  );
};
