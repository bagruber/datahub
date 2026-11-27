import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { fmtInt, fmtPct } from "@/lib/format";
import { BALKEN, GOLD_REIHE, INK, INK_MUTED, NAME_OBEN } from "@/lib/palette";
import { asArray, asScalar, isAnswered } from "@/lib/record";
import { useIsMobile } from "@/lib/useIsMobile";
import { ChartFrame } from "./ChartFrame";
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

// Zeilenmaße wie bei den Likert-Diagrammen: Balken oben, darunter die Werte.
const ZEILE = 44;
const INSET_UNTEN = 24;
/** Ein Wert unter dem Balken braucht diesen Abstand (Anteil der Breite) zum
 *  vorigen, sonst entfällt er; er steht dann noch im Tooltip und in der Tabelle. */
const MIN_ABSTAND = 0.09;

/** Stufe einer geordneten Skala: hell für die erste, dunkel für die letzte. */
function tonFuer(i: number, n: number): string {
  if (n <= 1) return GOLD_REIHE[2];
  const pos = (i / (n - 1)) * (GOLD_REIHE.length - 1);
  return GOLD_REIHE[Math.round(pos)];
}

type Segment = { zeile: string; stufe: string; x1: number; x2: number; anteil: number; anzahl: number; n: number };

/** Anteilsbalken für geordnete Antworten: ein schmaler Balken über die volle
 *  Breite, die Stufen von hell nach dunkel, die Anteile darunter. Gleiche
 *  Zeilenhöhe und Balkenstärke wie die Likert-Diagramme. */
export function Anteilsbalken({ records, reihen, kategorien }: Props) {
  const isMobile = useIsMobile();
  const labels = useMemo(() => kategorien.map((k) => k.label), [kategorien]);
  const toene = useMemo(() => labels.map((_, i) => tonFuer(i, labels.length)), [labels]);

  const zeilen = useMemo(
    () =>
      reihen.map((reihe, ri) => {
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
        return {
          schluessel: reihe.label ?? String(ri),
          label: reihe.label,
          n,
          counts,
          anteile: counts.map((c) => (n === 0 ? 0 : c / n)),
        };
      }),
    [records, reihen, kategorien],
  );

  const segmente = useMemo(
    () =>
      zeilen.flatMap((z) => {
        let x = 0;
        return z.anteile.map((anteil, i): Segment => {
          const s = { zeile: z.schluessel, stufe: labels[i], x1: x, x2: x + anteil, anteil, anzahl: z.counts[i], n: z.n };
          x += anteil;
          return s;
        });
      }),
    [zeilen, labels],
  );

  // Je Zeile von links nach rechts: ein Wert, der dem vorigen zu nahe käme, entfällt.
  const werte = useMemo(() => {
    const out: (Segment & { mitte: number })[] = [];
    for (const z of zeilen) {
      let zuletzt = -Infinity;
      for (const s of segmente.filter((s) => s.zeile === z.schluessel && s.anteil > 0)) {
        const mitte = (s.x1 + s.x2) / 2;
        if (mitte - zuletzt < MIN_ABSTAND) continue;
        out.push({ ...s, mitte });
        zuletzt = mitte;
      }
    }
    return out;
  }, [zeilen, segmente]);

  const mitZeilenName = zeilen.some((z) => z.label);
  const nameOben = isMobile && mitZeilenName;
  // Am Handy steht der Zeilenname über dem Balken statt links davon.
  const zeile = ZEILE + (nameOben ? NAME_OBEN : 0);
  // Ohne Band-Padding ist das Band genau eine Zeile hoch, der Balken genau BALKEN.
  const insetTop = zeile - INSET_UNTEN - BALKEN;
  // Mitte des Balkens relativ zur Mitte des Bands.
  const balkenMitte = (insetTop - INSET_UNTEN) / 2;
  const fontPx = isMobile ? 11 : 13;

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: zeilen.length * zeile + 8,
      marginTop: 4,
      marginBottom: 4,
      // Etwas Rand, damit ein Wert unter einer schmalen Endstufe nicht abgeschnitten wird.
      marginLeft: mitZeilenName && !nameOben ? 96 : 12,
      marginRight: 12,
      x: { domain: [0, 1], axis: null, label: null },
      y: { domain: zeilen.map((z) => z.schluessel), axis: null, label: null, padding: 0 },
      color: { type: "ordinal", domain: labels, range: toene },
      style: { fontFamily: "var(--font-sans)", fontSize: `${fontPx}px`, color: INK },
      marks: [
        ...(mitZeilenName && !nameOben
          ? [Plot.axisY({ tickSize: 0, fontSize: 12, color: INK_MUTED, lineWidth: 8, dy: balkenMitte })]
          : []),
        ...(nameOben
          ? [
              Plot.text(zeilen, {
                x: 0,
                y: "schluessel",
                text: "label",
                textAnchor: "start",
                dy: balkenMitte - 16,
                fontSize: fontPx,
                fill: INK_MUTED,
              }),
            ]
          : []),
        Plot.barX(segmente, {
          x1: "x1",
          x2: "x2",
          y: "zeile",
          fill: "stufe",
          insetTop,
          insetBottom: INSET_UNTEN,
          // 1 px Fuge zwischen den Stufen, wie bei Likert.
          insetLeft: 0.5,
          insetRight: 0.5,
          tip: true,
          title: (d: Segment) => `${d.stufe}\n${fmtInt(d.anzahl)} von ${fmtInt(d.n)}\n${fmtPct(d.anteil)}`,
        }),
        Plot.text(werte, {
          x: "mitte",
          y: "zeile",
          text: (d: Segment) => fmtPct(d.anteil),
          dy: balkenMitte + 20,
          fontSize: fontPx - 1,
          fontWeight: 600,
          fill: INK,
        }),
      ],
    }),
    [zeilen, zeile, mitZeilenName, nameOben, labels, toene, fontPx, segmente, insetTop, balkenMitte, werte],
  );

  return (
    <ChartFrame
      table={
        <ChartTable
          headers={[mitZeilenName ? "Frage" : "Antwort", ...(mitZeilenName ? labels : ["Antworten", "Anteil"])]}
          rows={
            mitZeilenName
              ? zeilen.map((z) => [z.label ?? "", ...z.anteile.map((a) => fmtPct(a))])
              : labels.map((l, i) => [l, fmtInt(zeilen[0]?.counts[i] ?? 0), fmtPct(zeilen[0]?.anteile[i] ?? 0)])
          }
        />
      }
    >
      {/* Legende wie die Skalenleiste der Likert-Diagramme, mit allen Stufen. */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        {labels.map((l, i) => (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="block h-[5px] w-[22px] rounded-sm" style={{ background: toene[i] }} />
            {l}
          </span>
        ))}
      </div>
      <PlotFigure options={options} ariaLabel={`${labels.join(", ")}: die Zahlen stehen in der Tabelle darunter`} />
    </ChartFrame>
  );
}
