import React from 'react';

const BADGE_COLORS = {
  yellow: 'bg-yellow text-ink border-ink',
  pink: 'bg-pink text-white border-ink',
  blue: 'bg-blue text-white border-ink',
  lime: 'bg-lime text-ink border-ink',
  purple: 'bg-purple text-white border-ink',
  ink: 'bg-ink text-white border-ink',
  gray: 'bg-gray-200 text-ink border-ink',
  danger: 'bg-[#ff4d4d] text-white border-ink',
  warning: 'bg-yellow text-ink border-ink',
  success: 'bg-lime text-ink border-ink',
};

export default function Badge({
  children,
  color = 'yellow',
  size = 'sm',
  className = '',
}) {
  const colorClass = BADGE_COLORS[color] || BADGE_COLORS.yellow;
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-heading font-bold rounded-full border-2 shadow-[2px_2px_0px_#161221] uppercase tracking-wide ${colorClass} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}
