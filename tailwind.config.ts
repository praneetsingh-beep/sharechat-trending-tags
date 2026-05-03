import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sc: {
          bg: '#0B0B12',
          card: '#16161F',
          border: '#23232E',
          accent: '#FF3D7F',
          accent2: '#7C5CFF',
          mute: '#9A9AA8',
          text: '#F4F4F6'
        }
      },
      fontFamily: {
        hindi: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
export default config;
