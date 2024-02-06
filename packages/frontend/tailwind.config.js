/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      "badminton-teal": "#16a085",
      "tennis-green": "#2ecc71",
      "squash-yellow": "#f1c40f",
      "font-gray": "#1c3e50",
    },
    fontFamily: {
      title: ['"Baloo Bhai 2"'],
      body: ['"Baloo 2"'],
    },
    extend: {},
  },
  plugins: [],
};
