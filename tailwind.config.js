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
        emerald: {
          DEFAULT: COLORS.emerald,
          light: COLORS.emeraldLight,
        },
        success: {
          DEFAULT: COLORS.success,
          light: COLORS.emeraldLight,
        },
        failure: {
          DEFAULT: COLORS.failure,
        },
        secondary: {
          DEFAULT: COLORS.secondary,
          dark: COLORS.secondaryDark,
        },
        up: {
          DEFAULT: COLORS.up,
        },
        down: {
          DEFAULT: COLORS.down,
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
