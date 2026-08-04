import { Link } from "react-router-dom";
import type { ManifestEntry } from "@/lib/data";
import { fmtInt } from "@/lib/format";

/** Home-page card for a dataset. Variants:
 *  - survey (default): year as eyebrow, N as respondents
 *  - statistik:        "AMTLICHE STATISTIK" as eyebrow, N as data points
 *
 *  Die Herkunft trägt die Zeile über dem Titel, nicht ein Farbstreifen an der
 *  Kartenkante: „2023" ist ein Metadatum und tritt zurück, „Amtliche Statistik"
 *  ist eine Einordnung und behält das Gold der Auszeichnungsfarbe. Damit
 *  unterscheidet Rangfolge statt Dekoration. */
export function DatasetCard({ entry }: { entry: ManifestEntry }) {
  const isStatistik = entry.kind === "statistik";
  const eyebrowClass = isStatistik ? "eyebrow" : "eyebrow text-ink-muted";
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
      className="group block rounded-xl bg-white border border-ink-line shadow-soft hover:shadow-lift transition-all hover:-translate-y-0.5 p-5"
    >
      <p className={eyebrowClass}>{eyebrowText}</p>
      <h3
        className={`headline text-xl sm:text-2xl mt-1 mb-2 transition-colors ${titleHoverClass}`}
      >
        {entry.title}
      </h3>
      <p className="text-sm text-ink-muted">{countText}</p>
    </Link>
  );
}
