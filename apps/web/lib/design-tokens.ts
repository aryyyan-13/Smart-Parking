/* ──────────────────────────────────────────────────────────
   Design Tokens — TypeScript constants for JS/TS usage
   ────────────────────────────────────────────────────────── */

export const colors = {
  bgDeep: "var(--bg-deep)",
  bgBase: "var(--bg-base)",
  bgElevated: "var(--bg-elevated)",
  surfaceGlass: "var(--surface-glass)",

  textPrimary: "var(--text-primary)",
  textMuted: "var(--text-muted)",

  accentCyan: "var(--accent-cyan)",
  accentBlue: "var(--accent-blue)",
  accentGlow: "var(--accent-glow)",

  statusAvailable: "var(--status-available)",
  statusOccupied: "var(--status-occupied)",
  statusSelected: "var(--status-selected)",
  statusPending: "var(--status-pending)",
  statusCancelled: "var(--status-cancelled)",
  statusConfirmed: "var(--status-confirmed)",

  border: "var(--border)",
  destructive: "var(--destructive)",
} as const;

/** Raw hex values for Three.js / Canvas / non-CSS contexts */
export const rawColors = {
  dark: {
    bgDeep: "#0A0A0F",
    bgBase: "#0F0F16",
    bgElevated: "#16161F",
    accentCyan: "#00FFFF",
    accentBlue: "#3B82F6",
    available: "#22C55E",
    occupied: "#374151",
    selected: "#3B82F6",
    textPrimary: "#EDEDEF",
    textMuted: "#8A8F98",
  },
  light: {
    bgDeep: "#F8FAFC",
    bgBase: "#FFFFFF",
    bgElevated: "#F1F5F9",
    accentCyan: "#0891B2",
    accentBlue: "#2563EB",
    available: "#16A34A",
    occupied: "#6B7280",
    selected: "#2563EB",
    textPrimary: "#0F172A",
    textMuted: "#64748B",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
} as const;

export const zIndex = {
  base: 0,
  sticky: 10,
  dropdown: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

export const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export const transitions = {
  easeSpring: "cubic-bezier(0.16, 1, 0.3, 1)",
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
} as const;
