import {
  Broom,
  Buildings,
  Car,
  ChatCircleText,
  Coffee,
  Plant,
  ShieldCheck,
  Stairs,
  Ticket,
  Bus,
  Wheelchair,
  type Icon,
} from "@phosphor-icons/react";
import { Klecks } from "./ui";

export type OffenesThema = { label: string; desc: string; icon?: string };

/** Die Icon-Namen im Datensatz sind ein eigenes kleines Set; die Zuordnung zu
 *  Phosphor steht hier, nicht im Datensatz. */
const ICONS: Record<string, Icon> = {
  clean: Broom,
  tunnel: Stairs,
  building: Buildings,
  food: Coffee,
  accessible: Wheelchair,
  shield: ShieldCheck,
  counter: Ticket,
  bus: Bus,
  parking: Car,
  design: Plant,
};

/** Ausgewertete Themen aus offenen Rückmeldungen als Register: keine Zahlen,
 *  deshalb kein Diagramm. Probe Formsprache, vorläufig (17.09.2026). */
export function OffeneThemen({ themen, farbe }: { themen: OffenesThema[]; farbe: string }) {
  return (
    <ul className="max-w-3xl border-y border-ink-line">
      {themen.map((t, i) => (
        <li key={t.label} className="grid grid-cols-[38px_1fr] gap-4 border-t border-ink-line py-4 first:border-t-0">
          <Klecks
            dicht
            variante={i}
            icon={ICONS[t.icon ?? ""] ?? ChatCircleText}
            text={farbe}
            flaeche={`color-mix(in srgb, ${farbe} 14%, white)`}
          />
          <div>
            <h3 className="font-display text-xl font-semibold leading-snug">{t.label}</h3>
            <p className="mt-1 text-ink-soft">{t.desc}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
