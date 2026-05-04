import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { isAnswered } from "@/lib/stats";
import { fmtInt, fmtPct } from "@/lib/format";
import { ACCENT_RED, INK, RADIUS } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import type { Codebook, Dataset } from "@/lib/data";

type Props = {
  records: Dataset["records"];
  codebook: Codebook;
  source: string;
  items?: { label: string; vals: number[] }[];
  color?: string;
  title?: string;
};

type Row = { label: string; share: number; count: number };

// Same constants for every BarH on the page → bar thickness identical and
// the 0 % gridline lands at the same x across charts.
const BAR_BAND = 32;
const MARGIN_LEFT_DESKTOP = 160;
const MARGIN_LEFT_MOBILE = 100;
const MARGIN_RIGHT = 56;
const MARGIN_TOP = 12;
const MARGIN_BOTTOM_DESKTOP = 32;
const MARGIN_BOTTOM_MOBILE = 24;

function buildRows(
  records: Dataset["records"],
  codebook: Codebook,
  source: string,
  items?: { label: string; vals: number[] }[],
): { rows: Row[]; answered: number } {
  let answered = 0;
  for (const r of records) if (isAnswered(r[source])) answered++;

  if (items && items.length > 0) {
    const rows = items.map((b) => {
      const set = new Set(b.vals);
      let count = 0;
      for (const r of records) {
        const v = r[source];
        if (!isAnswered(v)) continue;
        if (Array.isArray(v)) {
          if (v.some((x) => typeof x === "number" && set.has(x))) count++;
        } else if (typeof v === "number" && set.has(v)) {
          count++;
        }
      }
      return { label: b.label, count, share: answered === 0 ? 0 : count / answered };
    });
    return { rows, answered };
  }
  const cb = codebook[source] ?? {};
  const keys = Object.keys(cb).map(Number);
  const counts = new Map<number, number>(keys.map((k) => [k, 0]));
  for (const r of records) {
    const v = r[source];
    if (!isAnswered(v)) continue;
    const list = Array.isArray(v) ? v : [v];
    for (const x of list) {
      if (typeof x === "number" && counts.has(x)) counts.set(x, counts.get(x)! + 1);
    }
  }
  const rows = keys.map((k) => ({
    label: cb[String(k)],
    count: counts.get(k)!,
    share: answered === 0 ? 0 : counts.get(k)! / answered,
  }));
  return { rows, answered };
}

export function BarH({ records, codebook, source, items, color }: Props) {
  const isMobile = useIsMobile();
  const { rows, answered } = useMemo(
    () => buildRows(records, codebook, source, items),
    [records, codebook, source, items],
  );

  const sorted = useMemo(() => [...rows].sort((a, b) => b.share - a.share), [rows]);
  const accent = color ?? ACCENT_RED;

  const marginLeft = isMobile ? MARGIN_LEFT_MOBILE : MARGIN_LEFT_DESKTOP;
  const marginBottom = isMobile ? MARGIN_BOTTOM_MOBILE : MARGIN_BOTTOM_DESKTOP;
  const fontPx = isMobile ? 11 : 13;
  const axisPx = isMobile ? 10 : 12;

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: sorted.length * BAR_BAND + MARGIN_TOP + marginBottom,
      marginLeft,
      marginRight: MARGIN_RIGHT,
      marginTop: MARGIN_TOP,
      marginBottom,
      x: { axis: "bottom", percent: true, grid: true, label: null, ticks: isMobile ? 4 : 5 },
      y: { domain: sorted.map((d) => d.label), label: null, tickSize: 0 },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: `${fontPx}px`,
        color: INK,
        background: "transparent",
      },
      marks: [
        Plot.axisY({ lineWidth: isMobile ? 9 : 11, fontSize: axisPx }),
        Plot.barX(sorted, {
          x: "share",
          y: "label",
          fill: accent,
          insetTop: 4,
          insetBottom: 4,
          rx: RADIUS.bar,
          tip: true,
          title: (d: Row) =>
            `${d.label}\n${fmtInt(d.count)} Antworten\n${fmtPct(d.share)}${
              answered > 0 ? ` von ${fmtInt(answered)}` : ""
            }`,
        }),
        Plot.text(sorted, {
          x: "share",
          y: "label",
          text: (d: Row) => fmtPct(d.share),
          dx: 5,
          textAnchor: "start",
          fontWeight: 600,
          fontSize: fontPx,
          fill: INK,
        }),
        Plot.ruleX([0]),
      ],
    }),
    [sorted, accent, answered, isMobile, marginLeft, marginBottom, fontPx, axisPx],
  );

  return (
    <figure>
      <PlotFigure options={options} />
      <table className="sr-only">
        <thead>
          <tr><th>Kategorie</th><th>Anzahl</th><th>Anteil</th></tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <tr key={d.label}><td>{d.label}</td><td>{fmtInt(d.count)}</td><td>{fmtPct(d.share)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
