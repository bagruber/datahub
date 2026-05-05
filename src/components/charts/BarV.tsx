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
  slots?: { key: string; label: string }[];
  color?: string;
  title?: string;
  preserveOrder?: boolean;
};

type Row = { label: string; share: number; count: number };

// Vertical-bar variant of BarH for chronological / ordinal-temporal data.
// Bar widths fixed via x band; bar HEIGHTS encode share. X-axis labels
// rotate so 7–9 short labels fit on phone widths without overlapping.
const BAR_BAND = 32;       // px per bar (band width)
const HEIGHT = 280;
const MARGIN_TOP_DESKTOP = 12;
const MARGIN_TOP_MOBILE = 8;
const MARGIN_BOTTOM_DESKTOP = 80;
const MARGIN_BOTTOM_MOBILE = 70;
const MARGIN_LEFT = 48;    // y-axis percent labels
const MARGIN_RIGHT = 16;

function buildRows(
  records: Dataset["records"],
  codebook: Codebook,
  source: string,
  items?: { label: string; vals: number[] }[],
  slots?: { key: string; label: string }[],
): { rows: Row[]; answered: number } {
  let answered = 0;
  for (const r of records) if (isAnswered(r[source])) answered++;

  if (slots && slots.length > 0) {
    const rows = slots.map((s) => {
      let count = 0;
      for (const r of records) {
        const v = r[source];
        if (v && typeof v === "object" && !Array.isArray(v)) {
          if (Object.prototype.hasOwnProperty.call(v, s.key)) count++;
        }
      }
      return { label: s.label, count, share: answered === 0 ? 0 : count / answered };
    });
    return { rows, answered };
  }

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

export function BarV({ records, codebook, source, items, slots, color, preserveOrder }: Props) {
  const isMobile = useIsMobile();
  const { rows, answered } = useMemo(
    () => buildRows(records, codebook, source, items, slots),
    [records, codebook, source, items, slots],
  );

  // BarV defaults to declared/codebook order — vertical axes are usually
  // chronological, where sorting by share would scramble the time axis.
  const ordered = useMemo(
    () => (preserveOrder === false ? [...rows].sort((a, b) => b.share - a.share) : rows),
    [rows, preserveOrder],
  );

  const accent = color ?? ACCENT_RED;
  const marginTop = isMobile ? MARGIN_TOP_MOBILE : MARGIN_TOP_DESKTOP;
  const marginBottom = isMobile ? MARGIN_BOTTOM_MOBILE : MARGIN_BOTTOM_DESKTOP;
  const fontPx = isMobile ? 11 : 13;
  const axisPx = isMobile ? 10 : 12;

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: HEIGHT,
      marginLeft: MARGIN_LEFT,
      marginRight: MARGIN_RIGHT,
      marginTop,
      marginBottom,
      // Width left to PlotFigure ResizeObserver (responsive).
      x: {
        domain: ordered.map((d) => d.label),
        label: null,
        tickSize: 0,
        // Rotate so labels don't overlap; -35° reads naturally for time slots.
        tickRotate: -35,
      },
      y: {
        percent: true,
        grid: true,
        label: null,
        ticks: isMobile ? 3 : 4,
      },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: `${fontPx}px`,
        color: INK,
      },
      marks: [
        Plot.axisX({ fontSize: axisPx }),
        Plot.axisY({ fontSize: axisPx }),
        Plot.barY(ordered, {
          x: "label",
          y: "share",
          fill: accent,
          insetLeft: 4,
          insetRight: 4,
          rx: RADIUS.bar,
          tip: true,
          title: (d: Row) =>
            `${d.label}\n${fmtInt(d.count)} Antworten\n${fmtPct(d.share)}${
              answered > 0 ? ` von ${fmtInt(answered)}` : ""
            }`,
        }),
        // Bar-end percent label, like BarH's end-of-bar — but on top of each
        // column. Skipped on very small bars.
        Plot.text(ordered, {
          x: "label",
          y: "share",
          text: (d: Row) => (d.share >= 0.04 ? fmtPct(d.share) : ""),
          dy: -6,
          textAnchor: "middle",
          fontWeight: 600,
          fontSize: fontPx,
          fill: INK,
        }),
        Plot.ruleY([0]),
      ],
    }),
    [ordered, accent, answered, isMobile, marginTop, marginBottom, fontPx, axisPx],
  );

  // Width hint for the SVG container — narrower-than-full when there are few
  // bars so a 7-bar chart doesn't stretch awkwardly across a wide screen.
  const minWidth = ordered.length * BAR_BAND + MARGIN_LEFT + MARGIN_RIGHT;
  const figClass =
    ordered.length <= 7 ? "mx-auto w-full max-w-md" :
    ordered.length <= 9 ? "mx-auto w-full max-w-xl" :
    "w-full";

  return (
    <figure className={figClass} style={{ minWidth: 0 }}>
      <div style={{ minWidth }}>
        <PlotFigure options={options} />
      </div>
      <table className="sr-only">
        <thead>
          <tr><th>Kategorie</th><th>Anzahl</th><th>Anteil</th></tr>
        </thead>
        <tbody>
          {ordered.map((d) => (
            <tr key={d.label}><td>{d.label}</td><td>{fmtInt(d.count)}</td><td>{fmtPct(d.share)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
