import { useEffect, useRef } from "react";
import {
  subscribeListMutations,
  type ListMutationEvent,
} from "@/lib/list-mutation-events";

export function useListMutations(
  handler: (event: ListMutationEvent) => void,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(
    () =>
      subscribeListMutations((event) => {
        handlerRef.current(event);
      }),
    [],
  );
}
