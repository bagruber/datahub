import { Link } from "react-router-dom";
import type { ManifestEntry } from "@/lib/data";
import { fmtInt } from "@/lib/format";

/** Home-page card for a dataset. Variants:
 *  - survey (default): red accent strip, year as eyebrow, N as count
 *  - statistik:        gold accent strip, "AMTLICHE STATISTIK" eyebrow,
 *                      data points as count instead of respondents */
export function DatasetCard({ entry }: { entry: ManifestEntry }) {
  const isStatistik = entry.kind === "statistik";
  const accentClass = isStatistik
    ? "bg-gold-500 group-hover:bg-gold-700"
    : "bg-red-500 group-hover:bg-red-600";
  const titleHoverClass = isStatistik
    ? "group-hover:text-gold-700"
    : "group-hover:text-red-700";
  const eyebrowText = isStatistik ? "Amtliche Statistik" : String(entry.year);
  const countText = isStatistik
    ? `${fmtInt(entry.n)} Datenpunkte`
    : `${fmtInt(entry.n)} Antworten`;

  return (
    <Link
      to={`/d/${entry.id}`}
      className="group block rounded-xl bg-white border border-ink-line shadow-soft hover:shadow-lift transition-all hover:-translate-y-0.5 overflow-hidden"
    >
      <div className={`h-1 transition-colors ${accentClass}`} />
      <div className="p-5">
        <p className="eyebrow">{eyebrowText}</p>
        <h3
          className={`headline text-xl sm:text-2xl mt-1 mb-2 transition-colors ${titleHoverClass}`}
        >
          {entry.title}
        </h3>
        <p className="text-sm text-ink-muted">{countText}</p>
      </div>
    </Link>
  );
}
