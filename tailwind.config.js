/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Geist Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', '"Source Serif 4"', 'Charter', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'modal-dark': '0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.07)',
        'soft': '0 2px 10px -2px rgba(0, 0, 0, 0.06), 0 1px 3px -1px rgba(0, 0, 0, 0.04)',
        'glow-blue': '0 0 20px -3px rgba(37, 99, 235, 0.35)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
      },
      colors: {
        sat: {
          canvas: {
            light: '#FAFAFA',
            dark: '#090A0F',
          },
          surface: {
            light: '#FFFFFF',
            dark: '#11131A',
          },
          interactive: {
            light: '#F4F4F5',
            dark: '#181B24',
          },
          border: {
            light: '#E4E4E7',
            dark: '#222634',
          },
          text: {
            primary: {
              light: '#09090B',
              dark: '#F4F4F6',
            },
            muted: {
              light: '#52525B',
              dark: '#8E95A5',
            },
          },
          accent: {
            light: '#1D4ED8',
            dark: '#2563EB',
          },
        },
        bluebook: {
          blue: '#1D4ED8',
          hover: '#1E40AF',
          dark: '#11131A',
          header: '#F4F4F5',
          border: '#222634',
          selected: '#EFF6FF',
        }
      }
    },
  },
  plugins: [],
}
