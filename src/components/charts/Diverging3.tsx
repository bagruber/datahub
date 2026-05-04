import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { divergingStack } from "@/lib/diverging";
import { fmtInt, fmtPct } from "@/lib/format";
import { INK, RADIUS, STROKE } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import type { Dataset } from "@/lib/data";

type Option = { value: number; label: string; color: string };

type Props = {
  records: Dataset["records"];
  source: string;
  /** Three options in display order: [left, center/neutral, right]. */
  options: Option[];
  title?: string;
};

type Row = {
  label: string;
  color: string;
  share: number;
  count: number;
  n: number;
  x1: number;
  x2: number;
  row: string;
};

/** Diverging 3-option bar: option 0 extends left of centre, option 1 (the
 *  "neutral" / undecided) straddles 0, option 2 extends right of centre.
 *  Percentages live OUTSIDE the bar (left edge for the left option, right
 *  edge for the right option), matching the BarH end-of-bar convention.
 *  Centre option's percentage is omitted from the chart and read from the
 *  legend, since it has no "side" of its own. */
export function Diverging3({ records, source, options }: Props) {
  const isMobile = useIsMobile();

  const data: Row[] = useMemo(() => {
    let answered = 0;
    const counts = new Map<number, number>();
    options.forEach((o) => counts.set(o.value, 0));
    for (const r of records) {
      const v = r[source];
      if (typeof v !== "number" || !counts.has(v)) continue;
      answered++;
      counts.set(v, counts.get(v)! + 1);
    }
    const shares = options.map((o) => (answered === 0 ? 0 : counts.get(o.value)! / answered));
    const segs = divergingStack(shares, { negative: [0], center: 1, positive: [2] });
    return segs.map((seg) => {
      const o = options[seg.idx];
      return {
        label: o.label,
        color: o.color,
        count: counts.get(o.value)!,
        share: shares[seg.idx],
        n: answered,
        x1: seg.x1,
        x2: seg.x2,
        row: "all",
      };
    });
  }, [records, source, options]);

  const fontPx = isMobile ? 11 : 13;

  // Annotations: Option 0 (left) labelled at its x1 (leftmost edge),
  // Option 2 (right) labelled at its x2 (rightmost edge). Centre omitted.
  const annotations = useMemo(() => {
    const left = data.find((d) => d.label === options[0].label);
    const right = data.find((d) => d.label === options[2].label);
    return [
      ...(left ? [{ ...left, side: "left" as const, anchor: left.x1 }] : []),
      ...(right ? [{ ...right, side: "right" as const, anchor: right.x2 }] : []),
    ];
  }, [data, options]);

  const plotOptions: Plot.PlotOptions = useMemo(
    () => ({
      height: 110,
      marginLeft: 56,
      marginRight: 56,
      marginTop: 36,
      marginBottom: 28,
      x: {
        domain: [-1, 1],
        label: null,
        grid: false,
        ticks: [-1, -0.5, 0, 0.5, 1],
        tickFormat: (v: number) => `${Math.abs(Math.round(v * 100))}%`,
      },
      y: { domain: ["all"], axis: null },
      color: {
        type: "ordinal",
        domain: options.map((o) => o.label),
        range: options.map((o) => o.color),
        legend: true,
      },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: `${fontPx}px`,
        color: INK,
      },
      marks: [
        Plot.barX(data, {
          x1: "x1",
          x2: "x2",
          y: "row",
          fill: "label",
          insetTop: 0,
          insetBottom: 0,
          rx: RADIUS.bar,
          tip: true,
          title: (d: Row) =>
            `${d.label}\n${fmtInt(d.count)} von ${fmtInt(d.n)} Antworten\n${fmtPct(d.share)}`,
        }),
        // Outside percentage labels — left option goes left, right option goes right
        Plot.text(annotations, {
          x: (d: { anchor: number }) => d.anchor,
          y: "row",
          text: (d: { share: number }) => fmtPct(d.share),
          dx: (d: { side: "left" | "right" }) => (d.side === "left" ? -6 : 6),
          textAnchor: (d: { side: "left" | "right" }) => (d.side === "left" ? "end" : "start"),
          lineAnchor: "middle",
          fontWeight: 700,
          fontSize: fontPx,
          fill: INK,
        } as never),
        Plot.ruleX([0], { stroke: INK, strokeWidth: STROKE.centerRule }),
      ],
    }),
    [data, annotations, options, fontPx],
  );

  return (
    <figure className="w-full">
      <PlotFigure options={plotOptions} />
      <table className="sr-only">
        <thead><tr><th>Option</th><th>Anzahl</th><th>Anteil</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}><td>{d.label}</td><td>{fmtInt(d.count)}</td><td>{fmtPct(d.share)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
