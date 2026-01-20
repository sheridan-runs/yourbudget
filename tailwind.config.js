/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finance: {
          bg: '#0f172a',       // Slate 900
          card: '#1e293b',     // Slate 800
          green: '#10b981',    // Emerald 500
          red: '#ef4444',      // Red 500
          blue: '#3b82f6',     // Blue 500
        }
      }
    },
  },
  plugins: [],
}