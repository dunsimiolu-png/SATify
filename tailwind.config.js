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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      colors: {
        bluebook: {
          blue: '#0050d8',
          hover: '#003da6',
          dark: '#1e1e1e',
          header: '#f0f2f5',
          border: '#262626',
          selected: '#f0f6ff',
        }
      }
    },
  },
  plugins: [],
}
