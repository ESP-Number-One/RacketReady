/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      "badminton-teal": "#16a085",
      "tennis-purple": "#9B59B6",
      "squash-yellow": "#f1c40f",
      "font-gray": "#1c3e50",
      "p-green": { 100: "#2ECC71", 200: "#229553" },
      "p-grey": "#95A5A6",
    },
    fontFamily: {
      title: ['"Baloo Bhai 2"'],
      body: ['"Baloo 2"'],
    },
    extend: {},
  },
  plugins: [],
};
