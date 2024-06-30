/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'welcome-bg': "url('/src/assets/img/welcome.png')",
      },
    },
  },
  plugins: [],
}

