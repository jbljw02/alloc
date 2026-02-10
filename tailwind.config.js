const { COLORS } = require('./constants/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: COLORS.primary,
          light: COLORS.primaryLight,
        },
        danger: {
          DEFAULT: COLORS.danger,
        },
        success: {
          DEFAULT: COLORS.success,
          light: COLORS.successLight,
        },
        warning: {
          DEFAULT: COLORS.warning,
          light: COLORS.warningLight,
        },
      },
    },
  },
  plugins: [],
};