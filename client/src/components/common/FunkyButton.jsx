import React from 'react';

const COLOR_MAP = {
  // New primary luxury styles
  crimson: 'bg-[#B21818] text-white hover:bg-[#961414] shadow-sm hover:shadow active:scale-[0.98]',
  primary: 'bg-[#B21818] text-white hover:bg-[#961414] shadow-sm hover:shadow active:scale-[0.98]',
  outline: 'bg-white text-[#B21818] border border-[#B21818] hover:bg-[#FFF5F5] active:scale-[0.98]',
  dark: 'bg-[#1A181E] text-white hover:bg-[#2D2A32] shadow-sm hover:shadow active:scale-[0.98]',
  white: 'bg-white text-[#1A181E] border border-gray-200 hover:border-[#B21818] hover:text-[#B21818] active:scale-[0.98]',

  // Legacy variant mappings re-routed to brand palette
  yellow: 'bg-[#B21818] text-white hover:bg-[#961414] shadow-sm hover:shadow active:scale-[0.98]',
  pink: 'bg-[#8F1313] text-white hover:bg-[#720F0F] shadow-sm hover:shadow active:scale-[0.98]',
  lime: 'bg-white text-[#B21818] border border-[#B21818] hover:bg-[#FFF5F5] active:scale-[0.98]',
  blue: 'bg-[#1A181E] text-white hover:bg-[#2D2A32] shadow-sm hover:shadow active:scale-[0.98]',
  purple: 'bg-[#5C1010] text-white hover:bg-[#450C0C] shadow-sm hover:shadow active:scale-[0.98]',
  ink: 'bg-[#1A181E] text-white hover:bg-[#2D2A32] shadow-sm hover:shadow active:scale-[0.98]',
};

const SIZE_MAP = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5 font-medium',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2 font-medium',
  lg: 'px-6 py-3 text-base rounded-lg gap-2.5 font-semibold',
  xl: 'px-8 py-3.5 text-lg rounded-xl gap-3 font-semibold',
};

export default function FunkyButton({
  children,
  variant = 'crimson',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const colorClass = COLOR_MAP[variant] || COLOR_MAP.crimson;
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${colorClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
