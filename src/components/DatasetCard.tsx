import { Link } from "react-router-dom";
import type { ManifestEntry } from "@/lib/data";
import { fmtInt } from "@/lib/format";

export function DatasetCard({ entry }: { entry: ManifestEntry }) {
  return (
    <Link
      to={`/d/${entry.id}`}
      className="group block rounded-xl bg-white border border-ink-line shadow-soft hover:shadow-lift transition-all hover:-translate-y-0.5 overflow-hidden"
    >
      <div className="h-1 bg-red-500 group-hover:bg-red-600 transition-colors" />
      <div className="p-5">
        <p className="eyebrow">{entry.year}</p>
        <h3 className="headline text-xl sm:text-2xl mt-1 mb-2 group-hover:text-red-700 transition-colors">
          {entry.title}
        </h3>
        <p className="text-sm text-ink-muted">
          {fmtInt(entry.n)} Antworten
        </p>
      </div>
    </Link>
  );
}
