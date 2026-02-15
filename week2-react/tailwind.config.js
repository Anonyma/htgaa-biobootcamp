/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dna: { blue: '#3b82f6', green: '#10b981', red: '#ef4444', yellow: '#f59e0b' }
      }
    },
  },
  plugins: [],
}