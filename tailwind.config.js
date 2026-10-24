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
