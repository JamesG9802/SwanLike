import type { Config } from 'tailwindcss'

export default {
  //  Material UI compatiblity
  //  https://mui.com/material-ui/integrations/interoperability/#tailwind-css
  corePlugins: {
    preflight: false,
  },
  important: "#root",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      primary: "oklab(from var(--color-primary) l a b / <alpha-value>)",
      text: "oklab(from var(--color-text) l a b / <alpha-value>)",
      success: "oklab(from var(--color-success) l a b / <alpha-value>)",
      info: "oklab(from var(--color-info) l a b / <alpha-value>)",
      warn: "oklab(from var(--color-warn) l a b / <alpha-value>)",
      error: "oklab(from var(--color-error) l a b / <alpha-value>)",
      transparent: "transparent",
      current: "currentColor",
    },
    extend: {},
  },
  plugins: [],
} satisfies Config

