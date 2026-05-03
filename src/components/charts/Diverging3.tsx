import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { divergingStack } from "@/lib/diverging";
import { fmtInt, fmtPct } from "@/lib/format";
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
  xm: number;
  row: string;
};

/** Diverging 3-option bar: option 0 extends left of centre, option 1 (the
 *  "neutral" / undecided) straddles 0, option 2 extends right of centre.
 *  Bar uses full content width — full picture across the page. */
export function Diverging3({ records, source, options }: Props) {
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
        xm: (seg.x1 + seg.x2) / 2,
        row: "all",
      };
    });
  }, [records, source, options]);

  const plotOptions: Plot.PlotOptions = useMemo(
    () => ({
      height: 110,
      marginLeft: 24,
      marginRight: 24,
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
        fontSize: "13px",
        color: "#1c1c1c",
      },
      marks: [
        Plot.barX(data, {
          x1: "x1",
          x2: "x2",
          y: "row",
          fill: "label",
          insetTop: 0,
          insetBottom: 0,
          tip: true,
          title: (d: Row) =>
            `${d.label}\n${fmtInt(d.count)} von ${fmtInt(d.n)} Antworten\n${fmtPct(d.share)}`,
        }),
        Plot.text(data, {
          x: "xm",
          y: "row",
          text: (d: Row) =>
            d.share >= 0.08 ? `${d.label}\n${fmtPct(d.share)}` : "",
          fill: "white",
          fontWeight: 600,
          textAnchor: "middle",
          lineAnchor: "middle",
        } as never),
        Plot.ruleX([0], { stroke: "#1c1c1c", strokeWidth: 1.5 }),
      ],
    }),
    [data, options],
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
