import { KERBE, SKALA5, SKALA6, GOLD_STUFEN, GOLD_STUFEN6 } from "@/lib/palette";

type Props = {
  /** Farben der Stufen, von links nach rechts. */
  ramp: readonly string[];
  links: string;
  rechts: string;
  /** Kerbe in der Mitte: bei Skalen mit Mittelpunkt in der Mitte der Leiste. */
  kerbe?: boolean;
};

/** Legende der Skalen: ein durchgehendes Band ohne Lücken, die Wörter an den
 *  Enden, eine Kerbe an der Mitte. Probe Diagramme, vorläufig (18.09.2026):
 *  ersetzt die Nummernlegende und die Bildunterschrift unter dem Diagramm. */
export function Skalenleiste({ ramp, links, rechts, kerbe = true }: Props) {
  return (
    <div className="mb-3 flex items-center justify-center gap-2 text-xs text-ink-muted">
      <span>{links}</span>
      <span className="relative inline-flex">
        {ramp.map((c, i) => (
          <span
            key={i}
            className="block h-[5px] w-[22px] first:rounded-l-sm last:rounded-r-sm"
            style={{ background: c }}
          />
        ))}
        {kerbe && (
          <span
            aria-hidden
            className="absolute left-1/2 top-[-5px] block h-[4px] w-px -translate-x-1/2"
            style={{ background: KERBE }}
          />
        )}
      </span>
      <span>{rechts}</span>
    </div>
  );
}

/** Die Rampe zu einer Skala: werten (rot gegen Isar-Blau) oder ordnen (Gold). */
export function rampeFuer(tone: "evaluative" | "neutral", scale: 5 | 6): readonly string[] {
  if (tone === "evaluative") return scale === 5 ? SKALA5 : SKALA6;
  return scale === 5 ? GOLD_STUFEN : GOLD_STUFEN6;
}
