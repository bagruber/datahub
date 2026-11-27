import { useEffect } from "react";

const NAME = "Data Hub Moosburg";

/** Titel im Browser-Tab, in Lesezeichen und im Verlauf. Vorschauen geteilter
 *  Links lesen dagegen das statische HTML und sehen weiter nur den Namen. */
export function useTitel(titel?: string | null) {
  useEffect(() => {
    document.title = titel ? `${titel} · ${NAME}` : NAME;
  }, [titel]);
}
