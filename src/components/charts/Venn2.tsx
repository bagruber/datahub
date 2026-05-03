import { useMemo, useState } from "react";
import { layoutVenn2 } from "@/lib/venn";
import { fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Dataset } from "@/lib/data";

type Region = "onlyA" | "onlyB" | "both";

type Props = {
  records: Dataset["records"];
  source: string;
  values: number[]; // [codeA, codeB]
  labels: string[]; // [labelA, labelB]
  colors: string[]; // [colorA, colorB]
  title?: string;
};

const PAD = 36; // viewBox padding (room for outside labels)
const TARGET_W = 480; // nominal viewBox width; SVG scales to container

export function Venn2({ records, source, values, labels, colors }: Props) {
  const [hover, setHover] = useState<Region | null>(null);

  const counts = useMemo(() => {
    const [a, b] = values;
    let onlyA = 0;
    let onlyB = 0;
    let both = 0;
    let neither = 0;
    for (const r of records) {
      const v = r[source];
      const arr = Array.isArray(v) ? v : v != null ? [v] : [];
      const hasA = arr.some((x) => x === a);
      const hasB = arr.some((x) => x === b);
      if (hasA && hasB) both++;
      else if (hasA) onlyA++;
      else if (hasB) onlyB++;
      else neither++;
    }
    const totalA = onlyA + both;
    const totalB = onlyB + both;
    const total = onlyA + onlyB + both + neither;
    return { onlyA, onlyB, both, neither, totalA, totalB, total };
  }, [records, source, values]);

  const layout = useMemo(
    () => layoutVenn2(counts.totalA, counts.totalB, counts.both),
    [counts],
  );

  const denom = counts.onlyA + counts.onlyB + counts.both; // share over those who answered
  const share = (n: number) => (denom === 0 ? 0 : n / denom);

  if (!layout) {
    return (
      <p className="text-ink-muted text-sm py-8 text-center">
        Nicht genug Daten für ein Venn-Diagramm.
      </p>
    );
  }

  // Scale unit-space layout to the SVG viewBox
  const innerW = TARGET_W - PAD * 2;
  const scale = innerW / layout.width;
  const innerH = layout.height * scale;
  const VIEW_H = innerH + PAD * 2;
  const cxA = PAD + layout.cxA * scale;
  const cxB = PAD + layout.cxB * scale;
  const cy = PAD + layout.cy * scale;
  const rA = layout.rA * scale;
  const rB = layout.rB * scale;

  const onlyACenter = { x: cxA - rA * 0.55, y: cy };
  const onlyBCenter = { x: cxB + rB * 0.55, y: cy };
  const bothCenter = { x: (cxA + cxB) / 2, y: cy };

  const regionLabel = (region: Region) => {
    if (region === "onlyA") return `Nur ${labels[0]}`;
    if (region === "onlyB") return `Nur ${labels[1]}`;
    return `${labels[0]} & ${labels[1]}`;
  };
  const regionCount = (region: Region) =>
    region === "onlyA" ? counts.onlyA : region === "onlyB" ? counts.onlyB : counts.both;

  return (
    <figure>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-center">
        <svg
          viewBox={`0 0 ${TARGET_W} ${VIEW_H}`}
          width="100%"
          height={VIEW_H}
          role="img"
          aria-label={`Venn-Diagramm ${labels[0]} und ${labels[1]}`}
          onMouseLeave={() => setHover(null)}
          className="block"
        >
          {/* Outer set labels (above each circle) */}
          <text
            x={cxA}
            y={cy - rA - 10}
            textAnchor="middle"
            fontWeight={700}
            style={{ fontFamily: "var(--font-sans)", fontSize: 13 }}
            className="fill-ink"
          >
            {labels[0]}
          </text>
          <text
            x={cxB}
            y={cy - rB - 10}
            textAnchor="middle"
            fontWeight={700}
            style={{ fontFamily: "var(--font-sans)", fontSize: 13 }}
            className="fill-ink"
          >
            {labels[1]}
          </text>

          {/* Circles. Render second so its outline doesn't get covered. */}
          <circle
            cx={cxA}
            cy={cy}
            r={rA}
            fill={colors[0]}
            fillOpacity={hover === "onlyA" || hover === "both" ? 0.7 : 0.55}
            stroke={colors[0]}
            strokeOpacity={0.9}
            strokeWidth={1}
            style={{ transition: "fill-opacity 120ms", cursor: "pointer" }}
            onMouseEnter={() => setHover("onlyA")}
          />
          <circle
            cx={cxB}
            cy={cy}
            r={rB}
            fill={colors[1]}
            fillOpacity={hover === "onlyB" || hover === "both" ? 0.7 : 0.55}
            stroke={colors[1]}
            strokeOpacity={0.9}
            strokeWidth={1}
            style={{ transition: "fill-opacity 120ms", cursor: "pointer" }}
            onMouseEnter={() => setHover("onlyB")}
          />
          {/* Invisible hit-target for the lens — small ellipse at the midpoint.
              Lets the user hover the intersection without one circle stealing. */}
          {layout.d < layout.rA + layout.rB && layout.d > Math.abs(layout.rA - layout.rB) && (
            <ellipse
              cx={(cxA + cxB) / 2}
              cy={cy}
              rx={Math.max(8, (rA + rB - (cxB - cxA)) / 2)}
              ry={Math.min(rA, rB) * 0.55}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover("both")}
            />
          )}

          {/* Counts inside each region */}
          <RegionLabel
            x={onlyACenter.x}
            y={onlyACenter.y}
            primary={fmtInt(counts.onlyA)}
            secondary={fmtPct(share(counts.onlyA))}
            emphasized={hover === "onlyA"}
          />
          <RegionLabel
            x={bothCenter.x}
            y={bothCenter.y}
            primary={fmtInt(counts.both)}
            secondary={fmtPct(share(counts.both))}
            emphasized={hover === "both"}
          />
          <RegionLabel
            x={onlyBCenter.x}
            y={onlyBCenter.y}
            primary={fmtInt(counts.onlyB)}
            secondary={fmtPct(share(counts.onlyB))}
            emphasized={hover === "onlyB"}
          />
        </svg>

        {/* Legend with counts — also acts as hover target on desktop */}
        <ul className="grid gap-2 text-sm">
          {(["onlyA", "both", "onlyB"] as const).map((region) => {
            const isHover = hover === region;
            const dim = hover !== null && !isHover;
            const color = region === "onlyB" ? colors[1] : colors[0];
            return (
              <li key={region}>
                <button
                  type="button"
                  onMouseEnter={() => setHover(region)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(region)}
                  onBlur={() => setHover(null)}
                  className={cn(
                    "w-full grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
                    isHover ? "bg-cream-dark" : "hover:bg-cream-dark",
                  )}
                  style={{ opacity: dim ? 0.5 : 1 }}
                >
                  <span
                    aria-hidden
                    className="inline-block w-3 h-3 rounded-sm shrink-0 self-center"
                    style={{
                      background: region === "both" ? `linear-gradient(90deg, ${colors[0]} 50%, ${colors[1]} 50%)` : color,
                    }}
                  />
                  <span className="truncate text-ink">{regionLabel(region)}</span>
                  <span className="tabular-nums text-ink-soft shrink-0">
                    <span className="font-semibold text-ink">{fmtInt(regionCount(region))}</span>
                    <span className="text-ink-muted text-xs"> ({fmtPct(share(regionCount(region)))})</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <table className="sr-only">
        <tbody>
          <tr><td>Nur {labels[0]}</td><td>{fmtInt(counts.onlyA)}</td></tr>
          <tr><td>Nur {labels[1]}</td><td>{fmtInt(counts.onlyB)}</td></tr>
          <tr><td>Beide</td><td>{fmtInt(counts.both)}</td></tr>
          <tr><td>Keine Angabe</td><td>{fmtInt(counts.neither)}</td></tr>
        </tbody>
      </table>
    </figure>
  );
}

function RegionLabel({
  x,
  y,
  primary,
  secondary,
  emphasized,
}: {
  x: number;
  y: number;
  primary: string;
  secondary: string;
  emphasized: boolean;
}) {
  return (
    <g pointerEvents="none">
      <text
        x={x}
        y={y - 2}
        textAnchor="middle"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: emphasized ? 22 : 18,
          fontWeight: 700,
          transition: "font-size 120ms",
        }}
        className="fill-ink"
      >
        {primary}
      </text>
      <text
        x={x}
        y={y + 14}
        textAnchor="middle"
        style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}
        className="fill-ink-soft"
      >
        {secondary}
      </text>
    </g>
  );
}
