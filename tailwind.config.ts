import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        neon: '#ff2bd6',
        cyan: '#23d5ff',
        violet: '#6a00ff'
      },
      boxShadow: {
        vhs: '0 8px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.08)',
        neon: '0 0 10px rgba(255,43,214,.45), 0 0 26px rgba(35,213,255,.25)'
      },
      animation: {
        flicker: 'flicker 2.4s infinite alternate',
        scanline: 'scanline 9s linear infinite',
        pulseSlow: 'pulse 2.7s ease-in-out infinite'
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '1' },
          '25%': { opacity: '.88' },
          '40%': { opacity: '.96' },
          '55%': { opacity: '.9' },
          '100%': { opacity: '1' }
        },
        scanline: {
          '0%': { backgroundPosition: '0 -100%' },
          '100%': { backgroundPosition: '0 100%' }
        }
      }
    }
  },
  plugins: []
};

export default config;
