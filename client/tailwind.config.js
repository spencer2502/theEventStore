/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A181E',
        crimson: '#B21818',
        'crimson-dark': '#8E1313',
        'crimson-light': '#FDF4F4',
        pink: '#B21818',
        blue: '#8E1313',
        lime: '#A31C23',
        yellow: '#FBF7F4',
        purple: '#66161C',
        'panel-bg': '#FFFFFF',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', '"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', '"Space Grotesk"', 'sans-serif'],
      },
      borderWidth: {
        3: '2px',
      },
      boxShadow: {
        funky: '0 8px 24px -4px rgba(26, 24, 30, 0.08), 0 2px 6px -1px rgba(26, 24, 30, 0.04)',
        'funky-sm': '0 2px 8px -1px rgba(26, 24, 30, 0.06)',
        'funky-lg': '0 16px 36px -6px rgba(26, 24, 30, 0.12)',
        'funky-hover': '0 12px 28px -4px rgba(178, 24, 24, 0.14)',
        'funky-pink': '0 4px 14px 0 rgba(178, 24, 24, 0.25)',
        'funky-lime': '0 4px 14px 0 rgba(163, 28, 35, 0.25)',
        'funky-yellow': '0 4px 14px 0 rgba(178, 24, 24, 0.10)',
      },
      borderRadius: {
        sticker: '16px',
      },
    },
  },
  plugins: [],
};
