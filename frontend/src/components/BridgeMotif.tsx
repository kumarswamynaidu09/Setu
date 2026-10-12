import React from 'react';

interface BridgeMotifProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'teal' | 'navy' | 'saffron' | 'white';
}

/**
 * SETU Bridge Motif — An abstract civic motif representing multiple pathways
 * converging into one educational opportunity.
 * Incorporates three gentle arches spanning a central baseline.
 */
export const BridgeMotif: React.FC<BridgeMotifProps> = ({
  className = '',
  size = 'md',
  variant = 'teal'
}) => {
  const sizeMap = {
    sm: 'w-6 h-4',
    md: 'w-8 h-5',
    lg: 'w-12 h-7'
  };

  const colorMap = {
    teal: '#0A625D',
    navy: '#19324A',
    saffron: '#B07822',
    white: '#FFFFFF'
  };

  const color = colorMap[variant];

  return (
    <svg
      className={`${sizeMap[size]} ${className} shrink-0`}
      viewBox="0 0 48 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Baseline foundation */}
      <path
        d="M2 25H46"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Central main arch (primary access pathway) */}
      <path
        d="M10 25C10 13 17 6 24 6C31 6 38 13 38 25"
        stroke={color}
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      {/* Ascending pathway pillar 1 */}
      <path
        d="M17 25V13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Ascending pathway pillar 2 (center keystone) */}
      <path
        d="M24 25V6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Ascending pathway pillar 3 */}
      <path
        d="M31 25V13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Left subtle anchor arch */}
      <path
        d="M2 25C2 19 6 15 10 25"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Right subtle anchor arch */}
      <path
        d="M38 25C42 15 46 19 46 25"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};
