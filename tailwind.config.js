/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        slideInFromBelow: {
          '0%': {
            opacity: 0,
            transform: 'translateY(100%)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        'slide-in-from-below': 'slideInFromBelow 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
