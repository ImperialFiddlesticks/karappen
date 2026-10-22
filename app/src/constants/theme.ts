import "@/global.css";

import { Platform } from "react-native";

// Kårens färger, samma som på webbplatsen
export const Palette = {
  green: "#b0da5e",
  cyan: "#6ec3e4",
  olive: "#c6b158",
  blue: "#4b64ff",
  purple: "#c68bd0",
  salmon: "#f08e82",
  pink: "#ff7890",
  orange: "#fdbe6b",
  navy: "#111633",
} as const;

export const Colors = {
  light: {
    text: Palette.navy,
    textSecondary: "#5a5f7a",
    background: "#ffffff",
    backgroundElement: "#f1f2f7",
    backgroundSelected: "#e3e5f0",
    header: Palette.navy,
    onHeader: "#ffffff",
    primary: Palette.orange,
    onPrimary: Palette.navy,
    secondary: Palette.cyan,
    onSecondary: Palette.navy,
    accent: Palette.blue,
    success: Palette.green,
    danger: Palette.pink,
  },
  dark: {
    text: "#ededed",
    textSecondary: "#a9aec8",
    background: Palette.navy,
    backgroundElement: "#1c2347",
    backgroundSelected: "#2a3260",
    header: "#0b0f24",
    onHeader: "#ffffff",
    primary: Palette.orange,
    onPrimary: Palette.navy,
    secondary: Palette.cyan,
    onSecondary: Palette.navy,
    accent: Palette.cyan,
    success: Palette.green,
    danger: Palette.pink,
  },
} as const;

// Regnbågsranden under headern, i samma ordning som på webbplatsen
export const Stripe = [
  Palette.green,
  Palette.cyan,
  Palette.olive,
  Palette.blue,
  Palette.purple,
  Palette.salmon,
  Palette.pink,
  Palette.orange,
] as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export function eventColor(id: number) {
  return Stripe[id % Stripe.length];
}
