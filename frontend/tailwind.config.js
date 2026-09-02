/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cb: {
          yellow: {
            light: '#fff5c0',
            bright: '#ffe033',
            main: '#ffcc00',
            gold: '#f5a623',
            deep: '#e69500',
          },
          blue: {
            deep: '#06172e',
            navy: '#0b2545',
            royal: '#133e7c',
            card: '#184c94',
            light: '#2563eb',
          },
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

