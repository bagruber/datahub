// Worauf sich die Zahlen eines Diagramms beziehen: Antwortzahl, Art der Frage,
// Skala. Probe Diagramme, vorläufig (18.09.2026): steht als Zeile unter jedem
// Diagrammtitel und zählt mit den Filtern mit.

import { answeredCount } from "./aggregate";
import { isAnswered } from "./record";
import { fmtInt } from "./format";
import type { ChartSpec, Dataset } from "./data";

type Records = Dataset["records"];

const hatMehrfachnennung = (records: Records, source: string) =>
  records.some((r) => Array.isArray(r[source]) || (r[source] !== null && typeof r[source] === "object" && isAnswered(r[source])));

function spanne(records: Records, quellen: string[]): string | null {
  const zahlen = quellen.map((q) => answeredCount(records, q)).filter((n) => n > 0);
  if (zahlen.length === 0) return null;
  const min = Math.min(...zahlen), max = Math.max(...zahlen);
  return min === max ? `${fmtInt(min)} Antworten` : `${fmtInt(min)} bis ${fmtInt(max)} Antworten`;
}

/** Basiszeile eines Diagramms, oder null für Diagramme mit eigenen Zahlen
 *  (amtliche Statistik, Wahlergebnisse): dort steht die Quelle in der Fußzeile. */
export function basiszeile(spec: ChartSpec, records: Records): string | null {
  const teile: string[] = [];
  const typ: string = spec.type;
  const skala =
    typ === "likert6" ? "Skala von 1 bis 6"
      : typ === "likert5" || typ === "likert5_group" ? "Skala von 1 bis 5"
      : typ === "price" ? `Skala von 1 bis ${"scale" in spec && spec.scale === 6 ? 6 : 5}`
      : null;

  if ("reihen" in spec && Array.isArray(spec.reihen) && spec.reihen.length > 0) {
    const s = spanne(records, spec.reihen.map((r) => r.source));
    if (!s) return null;
    teile.push(`${s} mit Angabe`);
  } else if ("items" in spec && Array.isArray(spec.items) && spec.items.length > 0 && "source" in spec.items[0]) {
    const quellen = (spec.items as { source: string }[]).map((i) => i.source);
    const s = spanne(records, quellen);
    if (!s) return null;
    teile.push(`${s} mit Angabe`);
  } else if ("source" in spec && typeof spec.source === "string") {
    const n = answeredCount(records, spec.source);
    if (n === 0) return null;
    teile.push(`${fmtInt(n)} Antworten mit Angabe`);
    if (hatMehrfachnennung(records, spec.source)) teile.push("Mehrfachnennung möglich");
  } else {
    return null;
  }

  if (skala) teile.push(skala);

  return teile.join(" · ");
}
