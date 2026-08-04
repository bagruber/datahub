import { Link } from "react-router-dom";
import type { ManifestEntry } from "@/lib/data";
import { fmtInt } from "@/lib/format";

/** Home-page card for a dataset. Variants:
 *  - survey (default): weißer Grund, Jahr als Kicker, N als Antworten
 *  - statistik:        goldener Grund, „AMTLICHE STATISTIK", N als Datenpunkte
 *
 *  Die amtliche Statistik hebt sich über die ganze Fläche ab, nicht über einen
 *  Balken an einer Kante: Der Grundton wandert von Weiß ins Pergamentene und
 *  nimmt Rahmen, Kicker und Zahlzeile mit. Das liest sich als andere Art von
 *  Quelle, statt als angehefteter Farbstreifen.
 *
 *  ink-muted käme auf gold-100 nur auf 3,0:1 und damit unter die WCAG-AA-
 *  Grenze — auf dem getönten Grund übernimmt deshalb ink-soft (6,4:1). */
export function DatasetCard({ entry }: { entry: ManifestEntry }) {
  const isStatistik = entry.kind === "statistik";
  const surfaceClass = isStatistik
    ? "bg-gold-100 border-gold-200"
    : "bg-white border-ink-line";
  const eyebrowClass = isStatistik
    ? "eyebrow text-gold-700"
    : "eyebrow text-ink-muted";
  const countClass = isStatistik ? "text-ink-soft" : "text-ink-muted";
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
      className={`group block rounded-xl border shadow-soft hover:shadow-lift transition-all hover:-translate-y-0.5 p-5 ${surfaceClass}`}
    >
      <p className={eyebrowClass}>{eyebrowText}</p>
      <h3
        className={`headline text-xl sm:text-2xl mt-1 mb-2 transition-colors ${titleHoverClass}`}
      >
        {entry.title}
      </h3>
      <p className={`text-sm ${countClass}`}>{countText}</p>
    </Link>
  );
}
