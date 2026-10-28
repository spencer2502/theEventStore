import React from 'react';

const BADGE_COLORS = {
  yellow: 'bg-[#FAF4F0] text-[#8E1313] border-[#EBDDD5]',
  pink: 'bg-[#FDF4F4] text-[#B21818] border-[#F6D8D8]',
  blue: 'bg-[#F8F2F2] text-[#7A141A] border-[#EED4D6]',
  lime: 'bg-[#FCF5F5] text-[#A31C23] border-[#F5DADA]',
  purple: 'bg-[#F5EFEF] text-[#5C1419] border-[#E7D5D6]',
  ink: 'bg-[#1A181E] text-white border-[#1A181E]',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  crimson: 'bg-[#B21818] text-white border-[#B21818]',
};

export default function Badge({
  children,
  color = 'pink',
  size = 'sm',
  className = '',
}) {
  const colorClass = BADGE_COLORS[color] || BADGE_COLORS.pink;
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide ${colorClass} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}
