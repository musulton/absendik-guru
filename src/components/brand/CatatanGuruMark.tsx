import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** Logo mark Catatan Guru — buku catatan + pena. */
export function CatatanGuruMark({ size = 48, style }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Defs>
          <LinearGradient id="catatan-guru-bg" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#047857" />
            <Stop offset="0.55" stopColor="#059669" />
            <Stop offset="1" stopColor="#0d9488" />
          </LinearGradient>
        </Defs>
        <Rect width="48" height="48" rx="14" fill="url(#catatan-guru-bg)" />
        <Rect x="12" y="15" width="24" height="27" rx="4" fill="#fff" fillOpacity="0.98" />
        <Rect x="15.5" y="15" width="1.2" height="27" rx="0.6" fill="#fecaca" />
        <Rect x="18.5" y="20.5" width="13.5" height="1.5" rx="0.75" fill="#bbf7d0" />
        <Rect x="18.5" y="24.5" width="13.5" height="1.5" rx="0.75" fill="#bbf7d0" />
        <Rect x="18.5" y="28.5" width="13.5" height="1.5" rx="0.75" fill="#bbf7d0" />
        <Rect x="18.5" y="32.5" width="13.5" height="1.5" rx="0.75" fill="#bbf7d0" />
        <Rect x="18.5" y="36.5" width="13.5" height="1.5" rx="0.75" fill="#bbf7d0" />
        <Path d="M32 11.5 33.8 12.4 26.2 29.1 24.4 28.2 32 11.5Z" fill="#fb923c" />
        <Path d="M31 10.2 32.6 10.9 33.8 12.4 32 11.5 31 10.2Z" fill="#f9a8d4" />
        <Path d="M24.4 28.2 26.2 29.1 25.3 30.4 23.5 29.5 24.4 28.2Z" fill="#334155" />
        <Path
          d="M32.6 11.8 33.2 12.2"
          stroke="#fff"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeOpacity="0.45"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 0,
  },
});
