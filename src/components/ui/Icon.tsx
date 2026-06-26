import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/AppPreferencesContext";

/**
 * Pemetaan nama semantik aplikasi → glyph Feather.
 * Pakai nama semantik di seluruh app agar konsisten dan mudah diganti.
 */
const ICONS = {
  // navigasi
  home: "home",
  back: "arrow-left",
  chevronRight: "chevron-right",
  chevronLeft: "chevron-left",
  chevronDown: "chevron-down",
  chevronUp: "chevron-up",
  arrowRight: "arrow-right",
  more: "more-horizontal",
  close: "x",
  check: "check",
  plus: "plus",
  // entitas
  classes: "grid",
  students: "users",
  student: "user",
  subject: "book",
  attendance: "check-square",
  recap: "bar-chart-2",
  grades: "edit-3",
  gradeRecap: "clipboard",
  school: "book",
  calendar: "calendar",
  clock: "clock",
  note: "message-square",
  // aksi
  edit: "edit-2",
  trash: "trash-2",
  settings: "settings",
  info: "info",
  refresh: "refresh-cw",
  export: "download",
  search: "search",
  sort: "list",
  journal: "book-open",
  studentNote: "message-square",
  logout: "log-out",
  bell: "bell",
  cloud: "cloud",
  upload: "upload-cloud",
  download: "download-cloud",
  alert: "alert-triangle",
  // tema & bahasa
  sun: "sun",
  moon: "moon",
  globe: "globe",
  smartphone: "smartphone",
  google: "log-in",
  mail: "mail",
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  /** Warna mengikuti teks muted bila tidak diisi. */
  muted?: boolean;
};

export function Icon({ name, size = 20, color, muted }: Props) {
  const { colors } = useTheme();
  const resolved = color ?? (muted ? colors.textMuted : colors.text);
  return <Feather name={ICONS[name]} size={size} color={resolved} />;
}
