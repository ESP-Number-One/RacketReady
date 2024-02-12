/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sports
        badminton: "#16a085",
        tennis: "#9B59B6",
        squash: "#F1C40F",

        // Ability levels
        beginner: "#F39C12",
        intermediate: "#00B2FF",
        advanced: "#4B0096",

        // Forms
        "progress-blue": "#3498DB",

        // Primaries
        "p-green": { 100: "#2ECC71", 200: "#229553" },
        "p-grey": {
          100: "#bdc3c7",
          200: "#95A5A6",
          900: "#2C3E50",
        },
        "p-red": { 100: "#E74C3C", 200: "#C0392B" },
        "p-blue": "#2980B9",

        "pg-bar-blue": "#3498db",
        "pg-bar-gray": "#95A5A6",
      },
      fontFamily: {
        title: ['"Baloo Bhai 2"'],
        body: ['"Baloo 2"'],
      },
    },
  },
  plugins: [],
};
