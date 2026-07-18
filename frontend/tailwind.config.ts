import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#16213E', // primary text
          soft: '#5B6478', // secondary text
        },
        canvas: '#F7F8FA', // page background
        surface: '#FFFFFF', // card background
        border: '#E2E5EC',
        navy: {
          DEFAULT: '#1B2A4E', // primary brand / sidebar
          light: '#2E4372',
          dark: '#101A33',
        },
        teal: {
          DEFAULT: '#2F6F5E', // accent / active-success
          light: '#E4F0EC',
        },
        amber: {
          DEFAULT: '#C9862B', // pending / HR role badge
          light: '#FBF0DF',
        },
        rose: {
          DEFAULT: '#B94A48', // inactive / destructive
          light: '#F8E9E9',
        },
      },
      fontFamily: {
        display: ['var(--font-lexend)'],
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains)'],
      },
      borderRadius: {
        xl: '0.875rem',
      },
    },
  },
  plugins: [],
};

export default config;
