import { plugin } from "postcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    require("@tailwindcss/postcss"),
    require("autoprefixer"),
    require("tw-animate-css"),
    require("tailwindcss-animate"),
],
}
