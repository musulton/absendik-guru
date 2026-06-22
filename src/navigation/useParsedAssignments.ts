import { useMemo } from "react";
import type { GuruAssignment } from "@/lib/types";

export function useParsedAssignments(json: string): GuruAssignment[] {
  return useMemo(() => {
    try {
      return JSON.parse(json) as GuruAssignment[];
    } catch {
      return [];
    }
  }, [json]);
}
