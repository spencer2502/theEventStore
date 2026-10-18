import React from 'react';

const COLOR_MAP = {
  pink: 'bg-pink text-white hover:bg-[#fa2d72]',
  yellow: 'bg-yellow text-ink hover:bg-[#fabc1e]',
  lime: 'bg-lime text-ink hover:bg-[#b8e32c]',
  blue: 'bg-blue text-white hover:bg-[#2e4de6]',
  purple: 'bg-purple text-white hover:bg-[#7b3df0]',
  white: 'bg-panel-bg text-ink hover:bg-[#f6f2e9]',
  ink: 'bg-ink text-white hover:bg-[#251f38]',
};

const SIZE_MAP = {
  sm: 'px-3 py-1 text-xs gap-1.5',
  md: 'px-5 py-2 text-sm gap-2',
  lg: 'px-7 py-3 text-base gap-2.5',
  xl: 'px-8 py-3.5 text-lg gap-3',
};

export default function FunkyButton({
  children,
  variant = 'yellow',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const colorClass = COLOR_MAP[variant] || COLOR_MAP.yellow;
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn-funky ${colorClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
