/**
 * Rhodes Dispatch - Authentic Arknights Rhodes Island Emblem
 * Iconic Chess Rook Castle / Tactical Hexagonal Emblem with Originium Amber & Cyan Accents
 */

import React from 'react';

interface RhodesLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withPulse?: boolean;
}

export const RhodesLogo: React.FC<RhodesLogoProps> = ({
  size = 'md',
  className = '',
  withPulse = true
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      {/* Subtle Originium Ambient Glow */}
      {withPulse && (
        <div className="absolute inset-0 bg-[#F2542D]/20 rounded-xl blur-md animate-pulse pointer-events-none" />
      )}

      {/* Arknights Rhodes Island Tactical Chess Rook Vector Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_12px_rgba(242,84,45,0.3)] transition-transform duration-300 group-hover:scale-105"
      >
        {/* Outer Arknights Tactical Hexagon */}
        <polygon
          points="50,4 92,26 92,74 50,96 8,74 8,26"
          stroke="var(--line)"
          strokeWidth="3.5"
          fill="var(--softer)"
        />

        {/* Secondary Inset Border */}
        <polygon
          points="50,10 86,29 86,71 50,90 14,71 14,29"
          stroke="var(--line2)"
          strokeWidth="1.5"
          fill="var(--softer)"
        />

        {/* Iconic Arknights Rhodes Island Chess Rook Silhouette */}
        {/* Castle Battlements (Rook crenellations) */}
        <path
          d="M32 30 H40 V36 H46 V30 H54 V36 H60 V30 H68 V42 H64 L60 74 H40 L36 42 H32 Z"
          fill="var(--paper)"
          stroke="#F2542D"
          strokeWidth="2"
        />

        {/* Tactical Cross Aperture in the Tower */}
        <path
          d="M48 42 H52 V50 H60 V54 H52 V66 H48 V54 H40 V50 H48 Z"
          fill="#FFB81C"
        />

        {/* Originium Core Crystal Diamond Base */}
        <polygon
          points="50,22 55,28 50,34 45,28"
          fill="#F2542D"
        />

        {/* Tactical Warning Notch Stripes */}
        <line x1="20" y1="26" x2="28" y2="26" stroke="#FFB81C" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="72" y1="74" x2="80" y2="74" stroke="#F2542D" strokeWidth="2.5" strokeLinecap="round" />

        {/* PRTS Diagnostic Index Marks */}
        <circle cx="50" cy="82" r="2" fill="#2BB673" />
        <circle cx="43" cy="82" r="1.5" fill="var(--muted)" />
        <circle cx="57" cy="82" r="1.5" fill="var(--muted)" />
      </svg>
    </div>
  );
};