import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** Logo mark Absendik (attendance book) — dipakai di login, about, onboarding. */
export function AbsendikMark({ size = 48, style }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Defs>
          <LinearGradient id="absendik-bg" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#047857" />
            <Stop offset="0.5" stopColor="#059669" />
            <Stop offset="1" stopColor="#0d9488" />
          </LinearGradient>
        </Defs>
        <Rect width="48" height="48" rx="14" fill="url(#absendik-bg)" />
        <Rect x="18" y="7" width="4" height="6" rx="2" fill="#fff" fillOpacity="0.95" />
        <Rect x="26" y="7" width="4" height="6" rx="2" fill="#fff" fillOpacity="0.95" />
        <Rect x="10" y="12" width="28" height="29" rx="6" fill="#fff" fillOpacity="0.98" />
        <Rect x="10" y="12" width="28" height="8.5" rx="6" fill="#ecfdf5" />
        <Rect x="10" y="16.5" width="28" height="4" fill="#ecfdf5" />
        <Rect x="17" y="14.5" width="14" height="3.5" rx="1.75" fill="#86efac" />
        <Rect x="10" y="20" width="28" height="1.25" fill="#bbf7d0" />
        <Rect x="10" y="25.5" width="13" height="12.5" rx="3" fill="#fecaca" />
        <Path
          d="M13.5 28.75 19.5 34.75 M19.5 28.75 13.5 34.75"
          stroke="#b91c1c"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        <Rect x="25" y="25.5" width="13" height="12.5" rx="3" fill="#059669" />
        <Path
          d="M28.75 31.75 31.5 34.5 34.25 29.5"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
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
