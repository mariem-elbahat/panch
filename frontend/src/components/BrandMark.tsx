import React from 'react';

interface BrandMarkProps {
  size?: number;
  className?: string;
  dark?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 32, className = '', dark = false }) => {
  const bg = dark ? '#C6DF78' : '#174B3A';
  const fg = dark ? '#174B3A' : '#C6DF78';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" fill={bg} />
      {/* Top balance beam */}
      <line x1="20" y1="32" x2="80" y2="32" stroke={fg} strokeWidth="5.5" strokeLinecap="square" />
      {/* Central pillar / scale stem */}
      <line x1="50" y1="18" x2="50" y2="78" stroke={fg} strokeWidth="5.5" strokeLinecap="square" />
      {/* Left scale arm */}
      <line x1="33" y1="32" x2="23" y2="57" stroke={fg} strokeWidth="4.5" strokeLinecap="square" />
      {/* Right scale arm */}
      <line x1="67" y1="32" x2="77" y2="57" stroke={fg} strokeWidth="4.5" strokeLinecap="square" />
      {/* Left pan */}
      <line x1="15" y1="58" x2="34" y2="58" stroke={fg} strokeWidth="4.5" strokeLinecap="square" />
      {/* Right pan */}
      <line x1="66" y1="58" x2="85" y2="58" stroke={fg} strokeWidth="4.5" strokeLinecap="square" />
      {/* Scale base */}
      <line x1="33" y1="78" x2="67" y2="78" stroke={fg} strokeWidth="4.5" strokeLinecap="square" />
    </svg>
  );
};
