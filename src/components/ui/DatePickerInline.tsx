import { Platform, StyleSheet, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTheme } from "@/context/AppPreferencesContext";
import {
  dismissedPickerEvent,
  setPickerEvent,
} from "@/lib/datetime-picker-events";
import { radius, space } from "@/lib/theme";

type Props = {
  visible: boolean;
  value: Date;
  maximumDate?: Date;
  minimumDate?: Date;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
};

/** Android: dialog native. iOS: spinner inline ringkas di dalam kartu. */
export function DatePickerInline({
  visible,
  value,
  maximumDate,
  minimumDate,
  onChange,
}: Props) {
  const { isDark } = useTheme();

  if (!visible) return null;

  const pickerProps = {
    value,
    mode: "date" as const,
    maximumDate,
    minimumDate,
    onValueChange: (_event: { nativeEvent: { timestamp: number; utcOffset: number } }, date: Date) => {
      onChange(setPickerEvent(date.getTime()), date);
    },
    onDismiss: () => {
      onChange(dismissedPickerEvent(), undefined);
    },
  };

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        {...pickerProps}
        display="default"
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <DateTimePicker
        {...pickerProps}
        display="spinner"
        themeVariant={isDark ? "dark" : "light"}
        style={styles.picker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 2,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  picker: {
    height: 118,
    width: "100%",
  },
});
