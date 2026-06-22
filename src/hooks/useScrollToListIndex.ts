import { useCallback, useRef } from "react";
import type { FlatList } from "react-native";

type ScrollOptions = {
  viewPosition?: number;
  viewOffset?: number;
};

/**
 * Scroll FlatList ke index — aman bila layout belum siap (fallback offset).
 */
export function useScrollToListIndex<T>(getIndex: (key: string) => number) {
  const listRef = useRef<FlatList<T>>(null);

  const scrollToKey = useCallback(
    (key: string, options?: ScrollOptions) => {
      const index = getIndex(key);
      if (index < 0) return;
      listRef.current?.scrollToIndex({
        index,
        viewPosition: options?.viewPosition ?? 0.35,
        viewOffset: options?.viewOffset,
        animated: true,
      });
    },
    [getIndex],
  );

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      listRef.current?.scrollToOffset({
        offset: Math.max(0, info.averageItemLength * info.index),
        animated: true,
      });
    },
    [],
  );

  return { listRef, scrollToKey, onScrollToIndexFailed };
}
