/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0B12",
          900: "#12141F",
          850: "#171A28",
          800: "#1B1E2E",
          700: "#262A3D",
          600: "#363B54",
        },
        violet: {
          400: "#A796FF",
          500: "#8B6BFF",
          600: "#6E4CF0",
          700: "#5636C9",
        },
        amber: {
          300: "#FBCE6E",
          400: "#F6B93B",
          500: "#E29E1F",
        },
        mist: {
          100: "#EEF0FB",
          300: "#C4C7DE",
          400: "#9A9EBD",
          500: "#787C9C",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,107,255,0.35), 0 8px 30px -8px rgba(139,107,255,0.45)",
      },
    },
  },
  plugins: [],
}
