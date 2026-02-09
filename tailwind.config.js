/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        dark: '#0f172a',
        lightText: '#94a3b8'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      }
    }
  },
  plugins: []
};
