import { useMemo, useState } from "react";
import { arc, pie } from "d3-shape";
import { fmtPct, fmtInt } from "@/lib/format";
import type { Dataset } from "@/lib/data";
import { cn } from "@/lib/cn";

type Props = {
  records: Dataset["records"];
  source: string;
  labels: string[];
  values: number[];
  colors: string[];
  title?: string;
};

const SIZE = 220;
const R = SIZE / 2 - 4;
const RI = R * 0.58;

export function Pie({ records, source, labels, values, colors }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const data = useMemo(() => {
    let total = 0;
    const counts = new Array(values.length).fill(0);
    for (const r of records) {
      const v = r[source];
      if (typeof v !== "number") continue;
      const idx = values.indexOf(v);
      if (idx < 0) continue;
      counts[idx]++;
      total++;
    }
    return labels.map((label, i) => ({
      label,
      color: colors[i] ?? "#888",
      count: counts[i],
      share: total === 0 ? 0 : counts[i] / total,
    }));
  }, [records, source, values, labels, colors]);

  const total = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);

  const arcs = useMemo(() => {
    const layout = pie<typeof data[number]>()
      .sort(null)
      .padAngle(0.01)
      .value((d) => d.share)(data);
    const a = arc<(typeof layout)[number]>().innerRadius(RI).outerRadius(R).cornerRadius(2);
    return layout.map((p, i) => ({ d: a(p) ?? "", datum: p.data, idx: i }));
  }, [data]);

  const focused = hover !== null ? data[hover] : null;

  return (
    <figure>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <svg
          viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          role="img"
          className="shrink-0"
          onMouseLeave={() => setHover(null)}
        >
          {arcs.map((s) => {
            const dimmed = hover !== null && hover !== s.idx;
            return (
              <path
                key={s.idx}
                d={s.d}
                fill={s.datum.color}
                style={{
                  opacity: dimmed ? 0.35 : 1,
                  transition: "opacity 120ms",
                  cursor: "default",
                }}
                onMouseEnter={() => setHover(s.idx)}
                onFocus={() => setHover(s.idx)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${s.datum.label}: ${fmtInt(s.datum.count)} (${fmtPct(s.datum.share)})`}
              />
            );
          })}
          <text
            x={0}
            y={focused ? -10 : -4}
            textAnchor="middle"
            className="fill-ink"
            style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}
          >
            {focused ? fmtInt(focused.count) : fmtInt(total)}
          </text>
          <text
            x={0}
            y={focused ? 10 : 14}
            textAnchor="middle"
            className="fill-ink-muted"
            style={{ fontSize: 11, letterSpacing: "0.08em" }}
          >
            {focused ? focused.label.toUpperCase() : "ANTWORTEN"}
          </text>
          {focused && (
            <text
              x={0}
              y={26}
              textAnchor="middle"
              className="fill-ink-soft"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              {fmtPct(focused.share)}
            </text>
          )}
        </svg>
        <ul className="grid grid-cols-1 gap-1 text-sm flex-1 min-w-0">
          {data.map((d, i) => {
            const isHover = hover === i;
            const dimmed = hover !== null && !isHover;
            return (
              <li key={d.label}>
                <button
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded-md transition-colors text-left",
                    isHover ? "bg-cream-dark" : "hover:bg-cream-dark",
                  )}
                  style={{ opacity: dimmed ? 0.5 : 1 }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      aria-hidden
                      className="inline-block w-3 h-3 rounded-sm shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="truncate">{d.label}</span>
                  </span>
                  <span className="tabular-nums text-ink-soft shrink-0">
                    <span className="font-semibold text-ink">{fmtPct(d.share)}</span>
                    <span className="text-ink-muted text-xs"> ({fmtInt(d.count)})</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}
