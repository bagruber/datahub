import type { PressLink } from "@/lib/data";
import { PressLogo, PRESS_OUTLET_NAMES } from "./PressLogo";

function formatDate(s: string): string {
  // Accept ISO ("2023-06-14") and German ("14.06.2023" / "14. Juni 2023") forms.
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  if (iso) {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  return s;
}

export function PressCard({ link }: { link: PressLink }) {
  const thumb = link.thumb
    ? link.thumb.startsWith("http")
      ? link.thumb
      : `${import.meta.env.BASE_URL}press/thumbs/${link.thumb}`
    : null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl bg-white border border-ink-line shadow-soft hover:shadow-lift transition-all hover:-translate-y-0.5 overflow-hidden"
    >
      {/* Ohne Bild kein leerer Bildbereich, der ein fehlendes Foto vortäuscht;
          das Logo steht dann vor der Quelle. */}
      {thumb && (
        <div className="aspect-[16/9] relative bg-cream-dark overflow-hidden">
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="absolute top-2 right-2">
            <PressLogo outlet={link.outlet} size={32} />
          </span>
        </div>
      )}
      <div className="p-4">
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          {!thumb && <PressLogo outlet={link.outlet} size={24} />}
          {PRESS_OUTLET_NAMES[link.outlet]} · {formatDate(link.date)}
        </p>
        <h3 className="mt-1 font-semibold text-ink leading-snug group-hover:text-red-700 transition-colors">
          {link.title}
        </h3>
      </div>
    </a>
  );
}
