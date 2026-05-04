import { useMemo, useState } from "react";
import { layoutVenn2 } from "@/lib/venn";
import { fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Chip } from "@/components/svg/Chip";
import { ACCENT_GOLD, ACCENT_RED, STROKE } from "@/lib/palette";
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

const PAD = 40;
const TARGET_W = 480;

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

  const denom = counts.onlyA + counts.onlyB + counts.both;
  const share = (n: number) => (denom === 0 ? 0 : n / denom);

  if (!layout) {
    return (
      <p className="text-ink-muted text-sm py-8 text-center">
        Nicht genug Daten für ein Venn-Diagramm.
      </p>
    );
  }

  const colorA = colors[0] ?? ACCENT_RED;
  const colorB = colors[1] ?? ACCENT_GOLD;

  // Scale layout to viewBox
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
          <circle
            cx={cxA}
            cy={cy}
            r={rA}
            fill={colorA}
            fillOpacity={hover === "onlyA" || hover === "both" ? 0.7 : 0.55}
            stroke={colorA}
            strokeOpacity={0.9}
            strokeWidth={STROKE.outline}
            style={{ transition: "fill-opacity 120ms", cursor: "pointer" }}
            onMouseEnter={() => setHover("onlyA")}
          />
          <circle
            cx={cxB}
            cy={cy}
            r={rB}
            fill={colorB}
            fillOpacity={hover === "onlyB" || hover === "both" ? 0.7 : 0.55}
            stroke={colorB}
            strokeOpacity={0.9}
            strokeWidth={STROKE.outline}
            style={{ transition: "fill-opacity 120ms", cursor: "pointer" }}
            onMouseEnter={() => setHover("onlyB")}
          />
          {/* Lens hit-target (lets users hover the intersection cleanly) */}
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

          {/* Set-name chips above each circle */}
          <Chip x={cxA} y={cy - rA - 14} text={labels[0]} borderColor={colorA} />
          <Chip x={cxB} y={cy - rB - 14} text={labels[1]} borderColor={colorB} />

          {/* Region count chips */}
          <Chip
            x={onlyACenter.x}
            y={onlyACenter.y}
            text={fmtInt(counts.onlyA)}
            sub={fmtPct(share(counts.onlyA))}
            borderColor={colorA}
            fontSize={13}
            emphasized={hover === "onlyA"}
          />
          <Chip
            x={bothCenter.x}
            y={bothCenter.y}
            text={fmtInt(counts.both)}
            sub={fmtPct(share(counts.both))}
            borderColor="#888"
            fontSize={13}
            emphasized={hover === "both"}
          />
          <Chip
            x={onlyBCenter.x}
            y={onlyBCenter.y}
            text={fmtInt(counts.onlyB)}
            sub={fmtPct(share(counts.onlyB))}
            borderColor={colorB}
            fontSize={13}
            emphasized={hover === "onlyB"}
          />
        </svg>

        {/* Legend with counts — also acts as hover target */}
        <ul className="grid gap-2 text-sm">
          {(["onlyA", "both", "onlyB"] as const).map((region) => {
            const isHover = hover === region;
            const dim = hover !== null && !isHover;
            const regionLabel =
              region === "onlyA"
                ? `Nur ${labels[0]}`
                : region === "onlyB"
                ? `Nur ${labels[1]}`
                : `${labels[0]} & ${labels[1]}`;
            const count =
              region === "onlyA" ? counts.onlyA : region === "onlyB" ? counts.onlyB : counts.both;
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
                      background:
                        region === "both"
                          ? `linear-gradient(90deg, ${colorA} 50%, ${colorB} 50%)`
                          : region === "onlyA"
                          ? colorA
                          : colorB,
                    }}
                  />
                  <span className="truncate text-ink">{regionLabel}</span>
                  <span className="tabular-nums text-ink-soft shrink-0">
                    <span className="font-semibold text-ink">{fmtInt(count)}</span>
                    <span className="text-ink-muted text-xs"> ({fmtPct(share(count))})</span>
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
