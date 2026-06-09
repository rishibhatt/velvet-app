import { useRef } from "react";

/** Once `active` is true, stays mounted (for lazy-loaded modals / exit animations). */
export function useLazyMount(active: boolean) {
  const mounted = useRef(false);
  if (active) mounted.current = true;
  return mounted.current;
}
