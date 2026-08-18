import { Link } from "react-router-dom";
import type { ManifestEntry } from "@/lib/data";
import { fmtInt } from "@/lib/format";
import { CARD_KIND, type CardKind } from "@/lib/cardKind";

/** Home-page card for a dataset. Die Herkunft der Zahlen bestimmt den
 *  Grundton — welche Art das ist, steht in @/lib/cardKind. */
export function DatasetCard({ entry }: { entry: ManifestEntry }) {
  const kind: CardKind =
    entry.kind === "statistik" ? "statistik" : entry.kind === "eigen" ? "eigen" : "umfrage";
  const style = CARD_KIND[kind];

  // Die Jahreszahl allein sagte nicht, was man vor sich hat
  const eyebrowText = kind === "umfrage" ? `${style.label} ${entry.year}` : style.label;
  const countText =
    kind === "statistik"
      ? `${fmtInt(entry.n)} Datenpunkte`
      : kind === "eigen"
        ? `${fmtInt(entry.n)} Werte`
        : `${fmtInt(entry.n)} Antworten`;

  return (
    <Link
      to={`/d/${entry.id}`}
      className={`group block rounded-xl border p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift ${style.surface}`}
    >
      <p className={style.eyebrow}>{eyebrowText}</p>
      <h3
        className={`headline mt-1 mb-2 text-xl transition-colors sm:text-2xl ${style.titleHover}`}
      >
        {entry.title}
      </h3>
      <p className={`text-sm ${style.meta}`}>{countText}</p>
    </Link>
  );
}
