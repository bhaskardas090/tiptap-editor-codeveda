/**
 * The editor's text and highlight palette.
 *
 * Each colour is stored in the document as a CSS variable reference rather than
 * a literal hex — `var(--tt-palette-text-red, #C4554D)` — which is what lets a
 * saved document restyle itself when the theme changes: the variable resolves
 * against `.tiptap-dark` at render time. The literal after the comma is the
 * light-mode value, used as a fallback so stored HTML still renders correctly
 * for anyone displaying it without this package's stylesheet.
 *
 * The variables themselves are declared in `src/styles/_text-palette.scss`;
 * the hexes below are duplicated there and the two must stay in step. This
 * module is the source the pickers read, so the swatch a user clicks and the
 * colour they get are the same value.
 */

export interface PaletteColor {
  /** Slug used to build the CSS variable name. */
  name: string;
  label: string;
  /** Text colour, light and dark. */
  text: { light: string; dark: string };
  /** Highlight/background colour, light and dark. */
  background: { light: string; dark: string };
}

export const TEXT_PALETTE: PaletteColor[] = [
  {
    name: "default",
    label: "Default",
    text: { light: "#373530", dark: "#D4D4D4" },
    background: { light: "#FFFFFF", dark: "#191919" },
  },
  {
    name: "gray",
    label: "Gray",
    text: { light: "#787774", dark: "#9B9B9B" },
    background: { light: "#F1F1EF", dark: "#252525" },
  },
  {
    name: "brown",
    label: "Brown",
    text: { light: "#976D57", dark: "#A27763" },
    background: { light: "#F3EEEE", dark: "#2E2724" },
  },
  {
    name: "orange",
    label: "Orange",
    text: { light: "#CC782F", dark: "#CB7B37" },
    background: { light: "#F8ECDF", dark: "#36291F" },
  },
  {
    name: "yellow",
    label: "Yellow",
    text: { light: "#C29343", dark: "#C19138" },
    background: { light: "#FAF3DD", dark: "#372E20" },
  },
  {
    name: "green",
    label: "Green",
    text: { light: "#548164", dark: "#4F9768" },
    background: { light: "#EEF3ED", dark: "#242B26" },
  },
  {
    name: "blue",
    label: "Blue",
    text: { light: "#487CA5", dark: "#447ACB" },
    background: { light: "#E9F3F7", dark: "#1F282D" },
  },
  {
    name: "purple",
    label: "Purple",
    text: { light: "#8A67AB", dark: "#865DBB" },
    background: { light: "#F6F3F8", dark: "#2A2430" },
  },
  {
    name: "pink",
    label: "Pink",
    text: { light: "#B35488", dark: "#BA4A78" },
    background: { light: "#F9F2F5", dark: "#2E2328" },
  },
  {
    name: "red",
    label: "Red",
    text: { light: "#C4554D", dark: "#BE524B" },
    background: { light: "#FAECEC", dark: "#332523" },
  },
];

/** The value written into the document for a colour's text variant. */
export const textValue = (color: PaletteColor): string =>
  `var(--tt-palette-text-${color.name}, ${color.text.light})`;

/** The value written into the document for a colour's highlight variant. */
export const backgroundValue = (color: PaletteColor): string =>
  `var(--tt-palette-bg-${color.name}, ${color.background.light})`;
