import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { isAnswered } from "@/lib/stats";
import { fmtInt, fmtPct } from "@/lib/format";
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
const MARGIN_LEFT = 160;
const MARGIN_RIGHT = 60;
const MARGIN_TOP = 12;
const MARGIN_BOTTOM = 32;

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
  const { rows, answered } = useMemo(
    () => buildRows(records, codebook, source, items),
    [records, codebook, source, items],
  );

  const sorted = useMemo(() => [...rows].sort((a, b) => b.share - a.share), [rows]);
  const accent = color ?? "#c8102e";

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: sorted.length * BAR_BAND + MARGIN_TOP + MARGIN_BOTTOM,
      marginLeft: MARGIN_LEFT,
      marginRight: MARGIN_RIGHT,
      marginTop: MARGIN_TOP,
      marginBottom: MARGIN_BOTTOM,
      x: { axis: "bottom", percent: true, grid: true, label: null, ticks: 5 },
      y: { domain: sorted.map((d) => d.label), label: null, tickSize: 0 },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: "13px",
        color: "#1c1c1c",
        background: "transparent",
      },
      marks: [
        // Custom y axis with auto-wrap (lineWidth in em). With MARGIN_LEFT 160,
        // ~13px fonts have ~12 chars/em, so lineWidth 12 ≈ 144px ≈ 12em.
        Plot.axisY({ lineWidth: 11, fontSize: 12 }),
        Plot.barX(sorted, {
          x: "share",
          y: "label",
          fill: accent,
          insetTop: 4,
          insetBottom: 4,
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
          dx: 6,
          textAnchor: "start",
          fontWeight: 600,
          fill: "#1c1c1c",
        }),
        Plot.ruleX([0]),
      ],
    }),
    [sorted, accent, answered],
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
