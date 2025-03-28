
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'indigo-50': '#eef2ff',
        'indigo-600': '#4f46e5',
        'indigo-700': '#4338ca',
      },
      textColor: {
        'indigo-600': '#4f46e5',
        'indigo-700': '#4338ca',
      },
      borderColor: {
        'indigo-300': '#a5b4fc',
        'indigo-500': '#6366f1',
        'indigo-600': '#4f46e5',
      },
    },
  },
  plugins: [],
}
