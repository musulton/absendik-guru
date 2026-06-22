import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export function dismissedPickerEvent(): DateTimePickerEvent {
  return { type: "dismissed", nativeEvent: { timestamp: 0, utcOffset: 0 } };
}

export function setPickerEvent(
  timestamp: number,
  utcOffset = 0,
): DateTimePickerEvent {
  return { type: "set", nativeEvent: { timestamp, utcOffset } };
}
