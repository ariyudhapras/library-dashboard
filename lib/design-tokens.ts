import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Color palette inspired by traditional libraries and reading spaces
export const colors = {
  primary: {
    50: "#f5f7fa",
    100: "#e4e7eb",
    200: "#cbd2d9",
    300: "#9aa5b1",
    400: "#7b8794",
    500: "#616e7c",
    600: "#52606d",
    700: "#3e4c59",
    800: "#323f4b",
    900: "#1f2933",
  },
  accent: {
    50: "#e6f6ff",
    100: "#bae3ff",
    200: "#7cc4fa",
    300: "#47a3f3",
    400: "#2186eb",
    500: "#0967d2",
    600: "#0552b5",
    700: "#03449e",
    800: "#01337d",
    900: "#002159",
  },
  success: {
    50: "#e3f9e5",
    100: "#c1f2c7",
    200: "#91e697",
    300: "#51ca58",
    400: "#31b237",
    500: "#18981d",
    600: "#0f8613",
    700: "#0e7817",
    800: "#07600e",
    900: "#014807",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
}

// Typography scale
export const typography = {
  fontFamily: {
    sans: ["var(--font-inter)", "system-ui", "sans-serif"],
    serif: ["var(--font-merriweather)", "Georgia", "serif"],
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
}

// Spacing scale
export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem",
}

// Border radius scale
export const borderRadius = {
  none: "0",
  sm: "0.125rem",
  DEFAULT: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
}

// Shadow scale
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",
}

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 