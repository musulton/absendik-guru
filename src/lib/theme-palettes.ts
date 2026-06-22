export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryMuted: string;
  primaryBorder: string;
  accent: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  success: string;
  successBg: string;
  successBorder: string;
  headerBg: string;
  cardShadow: string;
};

/**
 * Tema nyaman di mata — kanvas lembut, kartu putih bersih,
 * aksen biru-teal segar dengan tint info/alert yang halus.
 */
export const lightTheme: ThemeColors = {
  bg: "#f5f8fc",
  surface: "#ffffff",
  surfaceElevated: "#ffffff",
  primary: "#1e40af",
  primaryMuted: "#e8f1fb",
  primaryBorder: "#c7daf0",
  accent: "#0d9488",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  danger: "#dc2626",
  dangerBg: "#fff5f5",
  dangerBorder: "#fecaca",
  success: "#059669",
  successBg: "#f0fdf4",
  successBorder: "#bbf7d0",
  headerBg: "#f5f8fc",
  cardShadow: "#1e40af10",
};

export const darkTheme: ThemeColors = {
  bg: "#0c1220",
  surface: "#151d2e",
  surfaceElevated: "#1a2438",
  primary: "#93c5fd",
  primaryMuted: "#1a2744",
  primaryBorder: "#3d4f6f",
  accent: "#5eead4",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  border: "#2d3748",
  danger: "#fca5a5",
  dangerBg: "#3b1515",
  dangerBorder: "#7f1d1d",
  success: "#6ee7b7",
  successBg: "#0a3529",
  successBorder: "#065f46",
  headerBg: "#0c1220",
  cardShadow: "#00000045",
};
