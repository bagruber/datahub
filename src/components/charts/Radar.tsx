import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { fmtInt } from "@/lib/format";
import type { Dataset } from "@/lib/data";

type Innovation = { key: string; name: string; color: string; sources: string[] };

type Props = {
  records: Dataset["records"];
  dimLabels: string[];
  invertedDims: number[];
  innovations: Innovation[];
  title?: string;
};

const SIZE = 380;
const PAD = 60;
const R = (SIZE - PAD * 2) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;

function angleFor(i: number, n: number) {
  return -Math.PI / 2 + (i * 2 * Math.PI) / n;
}

type Series = ReturnType<typeof buildSeries>[number];

function buildSeries(
  records: Dataset["records"],
  innovations: Innovation[],
  inverted: Set<number>,
  dimCount: number,
) {
  return innovations.map((inn) => {
    const stats = inn.sources.map((src, di) => {
      let sum = 0;
      let n = 0;
      for (const r of records) {
        const v = r[src];
        if (typeof v !== "number") continue;
        sum += inverted.has(di) ? 6 - v : v;
        n++;
      }
      return { mean: n === 0 ? null : sum / n, n };
    });
    const points = stats.map((s, i) => {
      const t = s.mean === null ? 0 : Math.max(0, Math.min(1, (s.mean - 1) / 4));
      const a = angleFor(i, dimCount);
      return [CX + Math.cos(a) * R * t, CY + Math.sin(a) * R * t];
    });
    return { ...inn, stats, points, polygon: points.map((p) => p.join(",")).join(" ") };
  });
}

export function Radar({ records, dimLabels, invertedDims, innovations }: Props) {
  const inverted = useMemo(() => new Set(invertedDims), [invertedDims]);
  const [hoverInn, setHoverInn] = useState<string | null>(null);
  const [hoverVertex, setHoverVertex] = useState<{ inn: string; di: number } | null>(null);

  const series: Series[] = useMemo(
    () => buildSeries(records, innovations, inverted, dimLabels.length),
    [records, innovations, inverted, dimLabels.length],
  );

  const grid = useMemo(
    () =>
      [0.25, 0.5, 0.75, 1].map((t) =>
        dimLabels
          .map((_, i) => {
            const a = angleFor(i, dimLabels.length);
            return [CX + Math.cos(a) * R * t, CY + Math.sin(a) * R * t].join(",");
          })
          .join(" "),
      ),
    [dimLabels],
  );

  const axisLabels = useMemo(
    () =>
      dimLabels.map((label, i) => {
        const a = angleFor(i, dimLabels.length);
        const x = CX + Math.cos(a) * (R + 18);
        const y = CY + Math.sin(a) * (R + 18);
        let anchor: "start" | "middle" | "end" = "middle";
        if (Math.cos(a) > 0.2) anchor = "start";
        else if (Math.cos(a) < -0.2) anchor = "end";
        return { label, x, y, anchor };
      }),
    [dimLabels],
  );

  const tooltip = (() => {
    if (!hoverVertex) return null;
    const s = series.find((x) => x.key === hoverVertex.inn);
    if (!s) return null;
    const stat = s.stats[hoverVertex.di];
    const dim = dimLabels[hoverVertex.di];
    const [x, y] = s.points[hoverVertex.di];
    return {
      x,
      y,
      text:
        `${s.name} · ${dim}\n` +
        `${stat.mean === null ? "–" : `Ø ${stat.mean.toFixed(2).replace(".", ",")}`}` +
        `\n${fmtInt(stat.n)} Antworten`,
      color: s.color,
    };
  })();

  return (
    <figure>
      <div className="grid gap-6 md:grid-cols-[auto_1fr] items-start">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          role="img"
          className="max-w-full h-auto"
        >
          {grid.map((pts, i) => (
            <polygon
              key={i}
              points={pts}
              fill="none"
              stroke="var(--color-ink-line)"
              strokeWidth={1}
            />
          ))}
          {dimLabels.map((_, i) => {
            const a = angleFor(i, dimLabels.length);
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={CX + Math.cos(a) * R}
                y2={CY + Math.sin(a) * R}
                stroke="var(--color-ink-line)"
                strokeWidth={1}
              />
            );
          })}
          {series.map((s) => {
            const isHover = hoverInn === s.key;
            const dimmed = hoverInn !== null && hoverInn !== s.key;
            return (
              <g key={s.key} style={{ opacity: dimmed ? 0.15 : 1, transition: "opacity 150ms" }}>
                <polygon
                  points={s.polygon}
                  fill={s.color}
                  fillOpacity={isHover ? 0.35 : 0.18}
                  stroke={s.color}
                  strokeWidth={isHover ? 2.5 : 1.75}
                  strokeLinejoin="round"
                />
                {s.points.map((p, i) => {
                  const isVH = hoverVertex?.inn === s.key && hoverVertex?.di === i;
                  if (s.stats[i].mean === null) return null;
                  return (
                    <circle
                      key={i}
                      cx={p[0]}
                      cy={p[1]}
                      r={isVH ? 6 : isHover ? 4 : 3}
                      fill={s.color}
                      stroke="white"
                      strokeWidth={isVH ? 2 : 0}
                      style={{ cursor: "pointer", transition: "r 100ms" }}
                      onMouseEnter={() => {
                        setHoverInn(s.key);
                        setHoverVertex({ inn: s.key, di: i });
                      }}
                      onMouseLeave={() => {
                        setHoverInn(null);
                        setHoverVertex(null);
                      }}
                    />
                  );
                })}
              </g>
            );
          })}
          {axisLabels.map((l) => (
            <text
              key={l.label}
              x={l.x}
              y={l.y}
              textAnchor={l.anchor}
              dominantBaseline="central"
              style={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              className="fill-ink-soft"
            >
              {l.label}
            </text>
          ))}
          {tooltip && (
            <g pointerEvents="none">
              <rect
                x={tooltip.x + 10}
                y={tooltip.y - 32}
                width={170}
                height={56}
                rx={4}
                fill="white"
                stroke={tooltip.color}
                strokeWidth={1.5}
              />
              {tooltip.text.split("\n").map((line, i) => (
                <text
                  key={i}
                  x={tooltip.x + 18}
                  y={tooltip.y - 16 + i * 14}
                  style={{ fontSize: 11, fontFamily: "var(--font-sans)" }}
                  className="fill-ink"
                  fontWeight={i === 0 ? 600 : 400}
                >
                  {line}
                </text>
              ))}
            </g>
          )}
        </svg>

        <ul className="grid gap-2 text-sm">
          {series.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                onMouseEnter={() => setHoverInn(s.key)}
                onMouseLeave={() => setHoverInn(null)}
                onFocus={() => setHoverInn(s.key)}
                onBlur={() => setHoverInn(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
                  hoverInn === s.key ? "bg-cream-dark" : "hover:bg-cream-dark",
                )}
              >
                <span
                  aria-hidden
                  className="inline-block w-3 h-3 rounded-sm shrink-0"
                  style={{ background: s.color }}
                />
                <span className="font-semibold text-ink">{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <table className="sr-only">
        <thead>
          <tr><th>Innovation</th>{dimLabels.map((d) => <th key={d}>{d}</th>)}</tr>
        </thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.key}>
              <td>{s.name}</td>
              {s.stats.map((stat, i) => (
                <td key={i}>{stat.mean === null ? "–" : stat.mean.toFixed(2)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
