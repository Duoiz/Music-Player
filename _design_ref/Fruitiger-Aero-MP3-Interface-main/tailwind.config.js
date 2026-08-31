/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      colors: {
        aqua: '#00d4ff',
        skyblue: '#0078d4',
        cyan: '#00bfff',
        glasswhite: 'rgba(255, 255, 255, 0.95)',
        glassdark: 'rgba(15, 115, 180, 0.4)',
      },
      keyframes: {
        pulse_glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        pulse_glow: 'pulse_glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
