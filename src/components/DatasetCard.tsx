import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CaretRight } from "@phosphor-icons/react";
import type { ManifestEntry } from "@/lib/data";
import { fmtInt } from "@/lib/format";
import { CARD_KIND, type CardKind } from "@/lib/cardKind";
import { KategorieZeile, Klecks } from "@/components/ui";

/** Home-page card for a dataset. Die Herkunft der Zahlen bestimmt den
 *  Grundton — welche Art das ist, steht in @/lib/cardKind. */
export function DatasetCard({ entry, variante }: { entry: ManifestEntry; variante: number }) {
  const kind: CardKind =
    entry.kind === "statistik" ? "statistik" : entry.kind === "eigen" ? "eigen" : "umfrage";
  const style = CARD_KIND[kind];

  return (
    <Kachel
      kind={kind}
      variante={variante}
      zeile={kind === "umfrage" ? `${style.label} ${entry.year}` : style.label}
      titel={entry.title}
      zahl={fmtInt(entry.n)}
      einheit={style.einheit}
      link={(className, children) => (
        <Link to={`/d/${entry.id}`} className={className}>
          {children}
        </Link>
      )}
    />
  );
}

/** Ab sm eine Kachel mit Grund je Herkunftsart, darunter ein Registereintrag
 *  ohne Rahmen. Die Anzahl steht unten über einer Haarlinie, damit sie in
 *  gleich hohen Kacheln auf einer Linie liegt. */
export function Kachel({ kind, variante, zeile, titel, satz, zahl, einheit, extern, link }: {
  kind: CardKind;
  variante: number;
  zeile: string;
  titel: string;
  satz?: string;
  zahl: string;
  einheit: string;
  extern?: boolean;
  link: (className: string, children: ReactNode) => ReactNode;
}) {
  const style = CARD_KIND[kind];
  const klecks = (dicht: boolean) => (
    <Klecks flaeche={style.farbe.flaeche} text={style.farbe.text} icon={style.icon} variante={variante} dicht={dicht} />
  );

  return link(
    `group grid grid-cols-[38px_1fr_18px] items-center gap-3 border-t border-ink-line py-3 first:border-t-0 transition-colors sm:flex sm:h-full sm:flex-col sm:items-stretch sm:gap-0 sm:rounded-xl sm:border sm:p-5 sm:first:border-t sm:hover:border-ink-muted ${style.surface}`,
    <>
      <span className="sm:hidden">{klecks(true)}</span>
      <span className="min-w-0 sm:flex sm:flex-1 sm:flex-col">
        <span className="flex items-center gap-3">
          <span className="hidden sm:inline-grid">{klecks(false)}</span>
          <KategorieZeile farbe={style.farbe.text}>
            {zeile}
          </KategorieZeile>
        </span>
        <span className="block font-display text-xl font-semibold leading-snug transition-colors group-hover:text-red-600 sm:mt-3 sm:text-2xl">
          {titel}
          {extern && (
            <ArrowUpRight size={14} aria-hidden className="ml-1 hidden align-baseline opacity-50 sm:inline" />
          )}
        </span>
        {satz && <span className={`mt-1 hidden text-sm sm:block ${style.meta}`}>{satz}</span>}
        <span className={`block text-sm sm:hidden ${style.meta}`}>
          {zahl} {einheit}
        </span>
        <span className="mt-auto hidden items-baseline gap-1.5 pt-4 sm:flex">
          <span className="w-full border-t border-ink-line pt-3">
            <span className="font-display text-3xl font-semibold leading-none lining-nums tabular-nums">
              {zahl}
            </span>{" "}
            <span className={`text-sm ${style.meta}`}>{einheit}</span>
          </span>
        </span>
      </span>
      <CaretRight size={18} aria-hidden className="text-ink-muted sm:hidden" />
    </>,
  );
}
