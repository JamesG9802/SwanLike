import type { Config } from 'tailwindcss'

import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
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
    extend: {
      colors: {
        primary: "oklab(from var(--color-primary) l a b / <alpha-value>)",
        surfacetint: "oklab(from var(--color-surfacetint) l a b / <alpha-value>)",
        onprimary: "oklab(from var(--color-onprimary) l a b / <alpha-value>)",
        primarycontainer: "oklab(from var(--color-primarycontainer) l a b / <alpha-value>)",
        onprimarycontainer: "oklab(from var(--color-onprimarycontainer) l a b / <alpha-value>)",
        secondary: "oklab(from var(--color-secondary) l a b / <alpha-value>)",
        onsecondary: "oklab(from var(--color-onsecondary) l a b / <alpha-value>)",
        secondarycontainer: "oklab(from var(--color-secondarycontainer) l a b / <alpha-value>)",
        onsecondarycontainer: "oklab(from var(--color-onsecondarycontainer) l a b / <alpha-value>)",
        tertiary: "oklab(from var(--color-tertiary) l a b / <alpha-value>)",
        ontertiary: "oklab(from var(--color-ontertiary) l a b / <alpha-value>)",
        tertiarycontainer: "oklab(from var(--color-tertiarycontainer) l a b / <alpha-value>)",
        ontertiarycontainer: "oklab(from var(--color-ontertiarycontainer) l a b / <alpha-value>)",
        error: "oklab(from var(--color-error) l a b / <alpha-value>)",
        onerror: "oklab(from var(--color-onerror) l a b / <alpha-value>)",
        errorcontainer: "oklab(from var(--color-errorcontainer) l a b / <alpha-value>)",
        onerrorcontainer: "oklab(from var(--color-onerrorcontainer) l a b / <alpha-value>)",
        background: "oklab(from var(--color-background) l a b / <alpha-value>)",
        onbackground: "oklab(from var(--color-onbackground) l a b / <alpha-value>)",
        surface: "oklab(from var(--color-surface) l a b / <alpha-value>)",
        onsurface: "oklab(from var(--color-onsurface) l a b / <alpha-value>)",
        surfacevariant: "oklab(from var(--color-surfacevariant) l a b / <alpha-value>)",
        onsurfacevariant: "oklab(from var(--color-onsurfacevariant) l a b / <alpha-value>)",
        outline: "oklab(from var(--color-outline) l a b / <alpha-value>)",
        outlinevariant: "oklab(from var(--color-outlinevariant) l a b / <alpha-value>)",
        shadow: "oklab(from var(--color-shadow) l a b / <alpha-value>)",
        scrim: "oklab(from var(--color-scrim) l a b / <alpha-value>)",
        inversesurface: "oklab(from var(--color-inversesurface) l a b / <alpha-value>)",
        inverseonsurface: "oklab(from var(--color-inverseonsurface) l a b / <alpha-value>)",
        inverseprimary: "oklab(from var(--color-inverseprimary) l a b / <alpha-value>)",
        primaryfixed: "oklab(from var(--color-primaryfixed) l a b / <alpha-value>)",
        onprimaryfixed: "oklab(from var(--color-onprimaryfixed) l a b / <alpha-value>)",
        primaryfixeddim: "oklab(from var(--color-primaryfixeddim) l a b / <alpha-value>)",
        onprimaryfixedvariant: "oklab(from var(--color-onprimaryfixedvariant) l a b / <alpha-value>)",
        secondaryfixed: "oklab(from var(--color-secondaryfixed) l a b / <alpha-value>)",
        onsecondaryfixed: "oklab(from var(--color-onsecondaryfixed) l a b / <alpha-value>)",
        secondaryfixeddim: "oklab(from var(--color-secondaryfixeddim) l a b / <alpha-value>)",
        onsecondaryfixedvariant: "oklab(from var(--color-onsecondaryfixedvariant) l a b / <alpha-value>)",
        tertiaryfixed: "oklab(from var(--color-tertiaryfixed) l a b / <alpha-value>)",
        ontertiaryfixed: "oklab(from var(--color-ontertiaryfixed) l a b / <alpha-value>)",
        tertiaryfixeddim: "oklab(from var(--color-tertiaryfixeddim) l a b / <alpha-value>)",
        ontertiaryfixedvariant: "oklab(from var(--color-ontertiaryfixedvariant) l a b / <alpha-value>)",
        surfacedim: "oklab(from var(--color-surfacedim) l a b / <alpha-value>)",
        surfacebright: "oklab(from var(--color-surfacebright) l a b / <alpha-value>)",
        surfacecontainerlowest: "oklab(from var(--color-surfacecontainerlowest) l a b / <alpha-value>)",
        surfacecontainerlow: "oklab(from var(--color-surfacecontainerlow) l a b / <alpha-value>)",
        surfacecontainer: "oklab(from var(--color-surfacecontainer) l a b / <alpha-value>)",
        surfacecontainerhigh: "oklab(from var(--color-surfacecontainerhigh) l a b / <alpha-value>)",
        surfacecontainerhighest: "oklab(from var(--color-surfacecontainerhighest) l a b / <alpha-value>)"
      },
    },
  },
  plugins: [],
}); // satisfies Config

