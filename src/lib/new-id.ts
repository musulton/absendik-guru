/** ID lokal — kompatibel React Native tanpa `crypto` global. */
export function newLocalId(): string {
  return `loc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
