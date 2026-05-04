import { useEffect, useState } from "react";

/** Tracks `(max-width: 639px)` — Tailwind's `< sm` breakpoint. Updates on
 *  viewport resize so charts can re-tune fonts/margins as the user rotates
 *  a phone or resizes a window. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 639px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
