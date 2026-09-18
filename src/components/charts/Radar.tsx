import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { fmtInt } from "@/lib/format";
import { GITTER, INK_MUTED, SERIE, STROKE } from "@/lib/palette";
import { ChartTable } from "./ChartTable";
import type { Dataset } from "@/lib/data";

type Innovation = { key: string; name: string; sources: string[] };

type Props = {
  records: Dataset["records"];
  dimLabels: string[];
  invertedDims: number[];
  innovations: Innovation[];
  title?: string;
};

const SKALA_MIN = 1;
const SKALA_MAX = 5;

type Stat = { mean: number | null; n: number };
type Reihe = { key: string; name: string; farbe: string; stats: Stat[] };

function winkel(i: number, n: number) {
  return -Math.PI / 2 + (i * 2 * Math.PI) / n;
}

/** Punkt einer Dimension auf dem Netz. */
function punkt(mean: number | null, di: number, n: number, cx: number, cy: number, r: number) {
  const t = mean === null ? 0 : Math.max(0, Math.min(1, (mean - SKALA_MIN) / (SKALA_MAX - SKALA_MIN)));
  const a = winkel(di, n);
  return [cx + Math.cos(a) * r * t, cy + Math.sin(a) * r * t] as const;
}

const polygon = (stats: Stat[], n: number, cx: number, cy: number, r: number) =>
  stats.map((s, i) => punkt(s.mean, i, n, cx, cy, r).join(",")).join(" ");

function Netz({ n, cx, cy, r }: { n: number; cx: number; cy: number; r: number }) {
  return (
    <g aria-hidden>
      {[2, 3, 4, 5].map((v) => (
        <polygon
          key={v}
          points={Array.from({ length: n }, (_, i) => punkt(v, i, n, cx, cy, r).join(",")).join(" ")}
          fill="none"
          stroke={GITTER}
        />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const a = winkel(i, n);
        return (
          <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke={GITTER} />
        );
      })}
    </g>
  );
}

function Achsen({ labels, cx, cy, r, klein }: { labels: string[]; cx: number; cy: number; r: number; klein?: boolean }) {
  return (
    <>
      {labels.map((l, i) => {
        const a = winkel(i, labels.length);
        const x = cx + Math.cos(a) * (r + (klein ? 14 : 20));
        const y = cy + Math.sin(a) * (r + (klein ? 14 : 20));
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        return (
          <text
            key={l}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="central"
            style={{ fontSize: klein ? 9 : 12, fontFamily: "var(--font-sans)" }}
            fill={INK_MUTED}
          >
            {l}
          </text>
        );
      })}
    </>
  );
}

/** Spinnennetz. Probe Diagramme, vorläufig (18.09.2026): eingeklappt ein Netz
 *  mit allen Ideen als Linien ohne Flächen, ausgeklappt ein kleines Netz je
 *  Idee mit dem Durchschnitt aller grau dahinter. */
export function Radar({ records, dimLabels, invertedDims, innovations }: Props) {
  const inverted = useMemo(() => new Set(invertedDims), [invertedDims]);
  const [einzeln, setEinzeln] = useState(false);
  const [hover, setHover] = useState<{ key: string; di: number } | null>(null);
  const n = dimLabels.length;

  const reihen: Reihe[] = useMemo(
    () =>
      innovations.map((inn, idx) => ({
        key: inn.key,
        name: inn.name,
        // Farben aus der Palette, nicht aus dem Datensatz.
        farbe: SERIE[idx % SERIE.length],
        stats: inn.sources.map((src, di) => {
          let sum = 0;
          let anzahl = 0;
          for (const r of records) {
            const v = r[src];
            if (typeof v !== "number") continue;
            sum += inverted.has(di) ? SKALA_MAX + SKALA_MIN - v : v;
            anzahl++;
          }
          return { mean: anzahl === 0 ? null : sum / anzahl, n: anzahl };
        }),
      })),
    [records, innovations, inverted],
  );

  // Durchschnitt aller Ideen: liegt in den einzelnen Netzen grau dahinter.
  const schnitt: Stat[] = useMemo(
    () =>
      dimLabels.map((_, di) => {
        const werte = reihen.map((r) => r.stats[di].mean).filter((m): m is number => m !== null);
        return {
          mean: werte.length ? werte.reduce((a, b) => a + b, 0) / werte.length : null,
          n: werte.length,
        };
      }),
    [reihen, dimLabels],
  );

  // In den kleinen Netzen ist nur Platz für ein Wort.
  const kurzeDims = useMemo(
    () =>
      dimLabels.map((l) => {
        const wort = l.replace(/\s*\(.*\)$/, "").split(/[ /]/)[0];
        return wort.length > 11 ? `${wort.slice(0, 10)}…` : wort;
      }),
    [dimLabels],
  );

  const zahl = (v: number | null, stellen = 1) =>
    v === null ? "–" : v.toFixed(stellen).replace(".", ",");

  const tabelle = (
    <ChartTable
      headers={["Idee", ...dimLabels, "Antworten"]}
      rows={reihen.map((r) => [r.name, ...r.stats.map((s) => zahl(s.mean, 2)), fmtInt(Math.max(...r.stats.map((s) => s.n)))])}
    />
  );

  const schalter = (
    <div className="mb-3 flex justify-end">
      <button
        type="button"
        aria-expanded={einzeln}
        onClick={() => setEinzeln((v) => !v)}
        className="rounded-lg border border-ink-line bg-white px-3 py-1 text-sm font-semibold text-ink hover:border-ink-muted"
      >
        {einzeln ? "Übereinander zeigen" : "Einzeln zeigen"}
      </button>
    </div>
  );

  if (einzeln) {
    const B = 250;
    const H = 190;
    const r = 48;
    const cx = B / 2;
    const cy = H / 2 + 4;
    return (
      <figure>
        {schalter}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {reihen.map((reihe) => (
            <div key={reihe.key}>
              <p className="text-center text-sm font-semibold text-ink">{reihe.name}</p>
              <svg
                viewBox={`0 0 ${B} ${H}`}
                width="100%"
                role="img"
                aria-label={`${reihe.name}: ${reihe.stats.map((s, i) => `${dimLabels[i]} ${zahl(s.mean)}`).join(", ")}`}
              >
                <Netz n={n} cx={cx} cy={cy} r={r} />
                <polygon points={polygon(schnitt, n, cx, cy, r)} fill="none" stroke="#b9b3a6" strokeWidth={1.2} />
                <polygon
                  points={polygon(reihe.stats, n, cx, cy, r)}
                  fill={reihe.farbe}
                  fillOpacity={0.14}
                  stroke={reihe.farbe}
                  strokeWidth={STROKE.outline}
                  strokeLinejoin="round"
                />
                {reihe.stats.map((s, i) => {
                  if (s.mean === null) return null;
                  const [x, y] = punkt(s.mean, i, n, cx, cy, r);
                  return <circle key={i} cx={x} cy={y} r={2.5} fill={reihe.farbe} />;
                })}
                <Achsen labels={kurzeDims} cx={cx} cy={cy} r={r} klein />
              </svg>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-muted">Grau: Durchschnitt aller Ideen</p>
        {tabelle}
      </figure>
    );
  }

  const B = 560;
  const H = 360;
  const r = 110;
  const c = H / 2;
  const cx = B / 2;
  const aktiv = hover ? reihen.find((x) => x.key === hover.key) : null;

  return (
    <figure>
      {schalter}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
        <svg
          viewBox={`0 0 ${B} ${H}`}
          width={B}
          height={H}
          className="max-w-full shrink-0"
          role="img"
          aria-label="Alle Ideen im Vergleich; die Werte stehen in der Tabelle darunter"
        >
          <Netz n={n} cx={cx} cy={c} r={r} />
          {[2, 3, 4, 5].map((v) => (
            <text key={v} x={cx + 4} y={punkt(v, 0, n, cx, c, r)[1]} style={{ fontSize: 9 }} fill={INK_MUTED}>
              {v}
            </text>
          ))}
          {reihen.map((reihe) => {
            const blass = hover !== null && hover.key !== reihe.key;
            return (
              <g key={reihe.key} style={{ opacity: blass ? 0.25 : 1, transition: "opacity 150ms" }}>
                <polygon
                  points={polygon(reihe.stats, n, cx, c, r)}
                  fill="none"
                  stroke={reihe.farbe}
                  strokeWidth={hover?.key === reihe.key ? STROKE.outlineHover : STROKE.outline}
                  strokeLinejoin="round"
                />
                {reihe.stats.map((s, i) => {
                  if (s.mean === null) return null;
                  const [x, y] = punkt(s.mean, i, n, cx, c, r);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={hover?.key === reihe.key && hover.di === i ? 5 : 3}
                      fill={reihe.farbe}
                      stroke="white"
                      strokeWidth={1.5}
                      tabIndex={0}
                      aria-label={`${reihe.name}, ${dimLabels[i]}: ${zahl(s.mean)} von 5`}
                      onMouseEnter={() => setHover({ key: reihe.key, di: i })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ key: reihe.key, di: i })}
                      onBlur={() => setHover(null)}
                    />
                  );
                })}
              </g>
            );
          })}
          <Achsen labels={dimLabels} cx={cx} cy={c} r={r} />
        </svg>

        <ul className="grid gap-1 text-sm">
          {reihen.map((reihe) => (
            <li key={reihe.key}>
              <button
                type="button"
                onMouseEnter={() => setHover({ key: reihe.key, di: 0 })}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover({ key: reihe.key, di: 0 })}
                onBlur={() => setHover(null)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                  hover?.key === reihe.key ? "bg-cream-dark" : "hover:bg-cream-dark",
                )}
              >
                <span aria-hidden className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ background: reihe.farbe }} />
                <span className="font-semibold text-ink">{reihe.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {aktiv && hover && (
        <p className="mt-2 text-sm text-ink-soft">
          <span className="font-semibold text-ink">{aktiv.name}</span> · {dimLabels[hover.di]}:{" "}
          {zahl(aktiv.stats[hover.di].mean)} von 5
        </p>
      )}
      {tabelle}
    </figure>
  );
}
