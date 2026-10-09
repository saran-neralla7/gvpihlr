/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gvp: {
          navy: {
            DEFAULT: "#0B2545",
            dark: "#06152B",
            light: "#132E5C",
            subtle: "#EBF1F8",
          },
          maroon: {
            DEFAULT: "#8B1528",
            dark: "#680E1C",
            light: "#A81E34",
            subtle: "#FCEBEF",
          },
          gold: {
            DEFAULT: "#C59B27",
            light: "#DFB847",
            subtle: "#FEF9E7",
          },
        },
      },
    },
  },
  plugins: [],
};
