import { useMemo, useState } from "react";
import { codeMatches, filterCodes, type Dataset, type FilterSpec } from "@/lib/data";
import { cn } from "@/lib/cn";
import { fmtInt, fmtPct } from "@/lib/format";

type Props = {
  spec: FilterSpec;
  records: Dataset["records"]; // unfiltered pool — bar heights stable
  selected: number[];
  onToggle: (idx: number) => void;
};

type Bar = { idx: number; label: string; count: number; share: number };

function buildBars(records: Dataset["records"], spec: FilterSpec): Bar[] {
  const labels = spec.type === "histogram_range" ? spec.groups.map((g) => g.label) : spec.labels;
  const total = records.length;
  return labels.map((label, idx) => {
    let count = 0;
    if (spec.type === "histogram_range") {
      const g = spec.groups[idx];
      if (g) {
        for (const r of records) {
          const v = r[spec.source];
          if (typeof v === "number" && v >= g.min && v <= g.max) count++;
        }
      }
    } else {
      const code = filterCodes(spec)[idx];
      if (code !== undefined) {
        for (const r of records) {
          const v = r[spec.source];
          if (Array.isArray(v)) {
            if (v.some((x) => codeMatches(x, code))) count++;
          } else if (codeMatches(v, code)) {
            count++;
          }
        }
      }
    }
    return { idx, label, count, share: total === 0 ? 0 : count / total };
  });
}

const VERT_H = 36;
const VB_BAR = 14;
const VB_GAP = 4;

export function FilterChart({ spec, records, selected, onToggle }: Props) {
  const bars = useMemo(() => buildBars(records, spec), [records, spec]);
  const max = useMemo(() => Math.max(1, ...bars.map((b) => b.count)), [bars]);
  const [hover, setHover] = useState<number | null>(null);
  const anySel = selected.length > 0;

  const vbWidth = bars.length * VB_BAR + (bars.length - 1) * VB_GAP;

  const selSummary = useMemo(() => {
    if (selected.length === 0) return null;
    if (selected.length === bars.length) return "alle";
    return selected.map((i) => bars[i]?.label).filter(Boolean).join(", ");
  }, [selected, bars]);

  const focused = hover !== null ? bars[hover] : null;

  const handleToggle = (idx: number) => onToggle(idx);

  return (
    <div className="rounded-lg bg-white border border-ink-line min-w-0 flex flex-col">
      {/* Header — fixed min-height so bars/legends align across cards even
          when one label wraps to 2 lines and another sits on 1. */}
      <div className="flex items-baseline justify-between gap-2 px-2.5 pt-2 pb-1.5 min-h-[3.1em]">
        <p className="eyebrow leading-snug" style={{ wordBreak: "break-word" }}>
          {spec.label}
        </p>
        {anySel && (
          <button
            type="button"
            onClick={() => selected.forEach((i) => onToggle(i))}
            aria-label={`${spec.label} zurücksetzen`}
            className="text-[10px] text-ink-muted hover:text-red-700 underline decoration-dotted shrink-0 self-start"
          >
            ×
          </button>
        )}
      </div>

      {/* Compact vertical bars — phone & tablet */}
      <div className="lg:hidden px-2.5 pb-2">
        <svg
          width="100%"
          height={VERT_H}
          viewBox={`0 0 ${vbWidth} ${VERT_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={spec.label}
          className="block"
          onMouseLeave={() => setHover(null)}
        >
          {bars.map((b) => {
            const x = b.idx * (VB_BAR + VB_GAP);
            const h = Math.max(2, (b.count / max) * VERT_H);
            const y = VERT_H - h;
            const on = selected.includes(b.idx);
            const dim = anySel && !on;
            const fill = on
              ? "var(--color-red-500)"
              : dim
              ? "var(--color-ink-line)"
              : hover === b.idx
              ? "var(--color-red-500)"
              : "var(--color-gold-400)";
            return (
              <rect
                key={b.idx}
                x={x}
                y={y}
                width={VB_BAR}
                height={h}
                rx={2}
                fill={fill}
                style={{ cursor: "pointer", transition: "fill 100ms" }}
                onClick={() => handleToggle(b.idx)}
                onMouseEnter={() => setHover(b.idx)}
                tabIndex={0}
                onFocus={() => setHover(b.idx)}
                onBlur={() => setHover(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggle(b.idx);
                  }
                }}
                aria-pressed={on}
                aria-label={`${b.label}: ${fmtInt(b.count)} (${fmtPct(b.share)})`}
              />
            );
          })}
        </svg>
        <p
          className={cn(
            "mt-1.5 text-[11px] leading-tight tabular-nums",
            focused ? "text-ink" : selSummary ? "text-red-700" : "text-ink-muted",
          )}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {focused
            ? `${focused.label}: ${fmtInt(focused.count)} · ${fmtPct(focused.share)}`
            : selSummary ?? "alle"}
        </p>
      </div>

      {/* Horizontal labelled bars — desktop only, uses the extra width */}
      <ul className="hidden lg:block px-1.5 pb-2 space-y-0.5">
        {bars.map((b) => {
          const on = selected.includes(b.idx);
          const dim = anySel && !on;
          return (
            <li key={b.idx}>
              <button
                type="button"
                onClick={() => handleToggle(b.idx)}
                onMouseEnter={() => setHover(b.idx)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(b.idx)}
                onBlur={() => setHover(null)}
                aria-pressed={on}
                className={cn(
                  "group w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-1.5 py-1 rounded-md text-left transition-colors",
                  on ? "bg-red-50" : "hover:bg-cream-dark",
                )}
              >
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-xs leading-snug truncate transition-colors",
                      on
                        ? "font-semibold text-red-700"
                        : dim
                        ? "text-ink-muted"
                        : "text-ink",
                    )}
                  >
                    {b.label}
                  </span>
                  <span
                    className="mt-1 block h-1.5 rounded-full bg-cream-dark overflow-hidden"
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "block h-full transition-all",
                        on
                          ? "bg-red-500"
                          : dim
                          ? "bg-ink-line"
                          : "bg-gold-400 group-hover:bg-red-500",
                      )}
                      style={{ width: `${(b.count / max) * 100}%` }}
                    />
                  </span>
                </span>
                <span className="tabular-nums text-[10px] text-ink-muted leading-tight text-right shrink-0">
                  <span className="block font-semibold text-ink">{fmtInt(b.count)}</span>
                  <span>{fmtPct(b.share)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
