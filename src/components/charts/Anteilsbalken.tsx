import { useMemo } from "react";
import { fmtInt, fmtPct } from "@/lib/format";
import { GOLD_REIHE, INK, INK_MUTED } from "@/lib/palette";
import { asArray, asScalar, isAnswered } from "@/lib/record";
import { ChartTable } from "./ChartTable";
import type { Dataset } from "@/lib/data";

type Reihe = { source: string; label?: string };

/** Eine Antwortstufe; sie kann mehrere Codes zusammenfassen. */
export type Kategorie = { label: string; codes: number[] };

type Props = {
  records: Dataset["records"];
  /** Eine Zeile je Frage; mehrere Zeilen vergleichen dieselbe Skala. */
  reihen: Reihe[];
  kategorien: Kategorie[];
  title?: string;
};

const HOEHE = 30;
const ZEILE = 64;
const LABEL_BREITE = 96;

/** Stufe einer geordneten Skala: hell für die erste, dunkel für die letzte. */
function tonFuer(i: number, n: number): string {
  if (n <= 1) return GOLD_REIHE[2];
  const pos = (i / (n - 1)) * (GOLD_REIHE.length - 1);
  return GOLD_REIHE[Math.round(pos)];
}

/** Anteilsbalken für geordnete Antworten: ein Balken über die volle Breite,
 *  die Stufen von hell nach dunkel. Probe Diagramme, vorläufig (18.09.2026):
 *  ersetzt den Ring, wo die Antworten eine Reihenfolge haben. */
export function Anteilsbalken({ records, reihen, kategorien }: Props) {
  const labels = kategorien.map((k) => k.label);
  const zeilen = useMemo(
    () =>
      reihen.map((reihe) => {
        const counts = kategorien.map(() => 0);
        let n = 0;
        for (const r of records) {
          const v = r[reihe.source];
          if (!isAnswered(v)) continue;
          const liste = Array.isArray(v) ? asArray(v) : [asScalar(v)].filter((x): x is number => x !== null);
          const treffer = kategorien.findIndex((k) => k.codes.some((code) => liste.some((x) => x === code)));
          if (treffer < 0) continue;
          counts[treffer]++;
          n++;
        }
        return { label: reihe.label, n, counts, anteile: counts.map((c) => (n === 0 ? 0 : c / n)) };
      }),
    [records, reihen, kategorien],
  );

  const mitZeilenName = zeilen.some((z) => z.label);
  const links = mitZeilenName ? LABEL_BREITE : 0;
  const breite = 640;
  const plot = breite - links;
  const hoehe = zeilen.length * ZEILE;

  return (
    <figure>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
        {labels.map((l, i) => (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: tonFuer(i, labels.length) }} />
            {l}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${breite} ${hoehe}`}
        width="100%"
        role="img"
        aria-label={`${labels.join(", ")}: die Zahlen stehen in der Tabelle darunter`}
      >
        {zeilen.map((zeile, zi) => {
          const y = zi * ZEILE + 8;
          let x = links;
          return (
            <g key={zeile.label ?? zi}>
              {zeile.label && (
                <text x={links - 10} y={y + HOEHE / 2} textAnchor="end" dominantBaseline="middle" fill={INK} style={{ fontSize: 13 }}>
                  {zeile.label}
                </text>
              )}
              {zeile.anteile.map((anteil, i) => {
                const w = plot * anteil;
                const links_x = x;
                x += w;
                if (w <= 0) return null;
                const ton = tonFuer(i, labels.length);
                const dunkel = i >= labels.length / 2;
                return (
                  <g key={i}>
                    <rect x={links_x + 0.5} y={y} width={Math.max(0, w - 1)} height={HOEHE} fill={ton} />
                    {w > 40 ? (
                      <text
                        x={links_x + w / 2}
                        y={y + HOEHE / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={dunkel ? "#fff" : INK}
                        style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: "lining-nums tabular-nums" }}
                      >
                        {fmtPct(anteil)}
                      </text>
                    ) : (
                      <text
                        x={links_x + w / 2}
                        y={y + HOEHE + 13}
                        textAnchor="middle"
                        fill={INK_MUTED}
                        style={{ fontSize: 11, fontVariantNumeric: "lining-nums tabular-nums" }}
                      >
                        {fmtPct(anteil)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <ChartTable
        headers={[mitZeilenName ? "Frage" : "Antwort", ...(mitZeilenName ? labels : ["Antworten", "Anteil"])]}
        rows={
          mitZeilenName
            ? zeilen.map((z) => [z.label ?? "", ...z.anteile.map((a) => fmtPct(a))])
            : labels.map((l, i) => [l, fmtInt(zeilen[0]?.counts[i] ?? 0), fmtPct(zeilen[0]?.anteile[i] ?? 0)])
        }
      />
    </figure>
  );
}
