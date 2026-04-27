// ============================================================
// 🎨 PALETA BASE — mude AQUI para alterar o tema inteiro
// ============================================================
const palette = {
  black: "#0F1210",
  dark: "#1A1E1A",
  darkMid: "#2A3228",

  white: "#F5F0E8",
  white60: "rgba(245, 240, 232, 0.6)",
  white35: "rgba(245, 240, 232, 0.35)",
  white12: "rgba(255, 255, 255, 0.12)",
  white10: "rgba(255, 255, 255, 0.10)",
  white08: "rgba(255, 255, 255, 0.08)",
  white06: "rgba(255, 255, 255, 0.06)",

  amber: "#E08A38",
  amber20: "rgba(224, 138, 56, 0.2)",
  amber50: "rgba(224, 138, 56, 0.5)",

  green: "#4CAF50",
  blue: "#5B8DEF",

  red: "#EF4444",
  red15: "rgba(239, 68, 68, 0.15)",
  emerald: "#22C55E",
  emerald15: "rgba(34, 197, 94, 0.15)",
  yellow: "#F59E0B",

  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

// ============================================================
// 🏷️ CORES SEMÂNTICAS — derivadas da paleta
// ============================================================
export const colors = {
  bgPrimary: palette.dark,
  bgSecondary: palette.black,
  bgGradientTop: palette.darkMid,
  bgCard: palette.white08,
  bgCardHover: palette.white12,
  bgInput: palette.white06,
  bgInputFocus: palette.white10,
  bgOverlay: palette.overlay,

  textPrimary: palette.white,
  textSecondary: palette.white60,
  textMuted: palette.white35,
  textInverse: palette.dark,

  accent: palette.amber,
  accentLight: palette.amber20,
  accentBorder: palette.amber50,

  categoryEvent: palette.amber,
  categoryFood: palette.green,
  categoryPersonal: palette.blue,

  border: palette.white12,
  borderFocus: palette.amber50,

  error: palette.red,
  errorLight: palette.red15,
  success: palette.emerald,
  successLight: palette.emerald15,
  warning: palette.yellow,
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

export { palette };
