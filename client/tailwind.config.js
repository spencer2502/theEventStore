/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#161221',
        pink: '#FF3E7F',
        blue: '#3B5BFF',
        lime: '#C6F135',
        yellow: '#FFC72C',
        purple: '#8C52FF',
        'panel-bg': '#FFFDF8',
      },
      fontFamily: {
        heading: ['"Baloo 2"', 'cursive', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        funky: '8px 8px 0px #161221',
        'funky-sm': '4px 4px 0px #161221',
        'funky-lg': '12px 12px 0px #161221',
        'funky-hover': '6px 6px 0px #161221',
        'funky-pink': '6px 6px 0px #FF3E7F',
        'funky-lime': '6px 6px 0px #C6F135',
        'funky-yellow': '6px 6px 0px #FFC72C',
      },
      borderRadius: {
        sticker: '24px',
      },
    },
  },
  plugins: [],
};
