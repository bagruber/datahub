import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import type { Dataset, FilterSpec } from "@/lib/data";
import { applyFilters, istOhneAngabe, ohneAngabeIndex, type FilterSelections } from "@/lib/filters";
import { cn } from "@/lib/cn";
import { fmtInt } from "@/lib/format";
import { buildBars, type Bar } from "./FilterChart";

type Props = {
  filters: FilterSpec[];
  records: Dataset["records"];
  selections: FilterSelections;
  gefiltert: number;
  onToggle: (key: string, idx: number) => void;
  onClear: (key: string) => void;
};

/** Filter am Handy: je Kategorie ein Knopf, der eine Auswahlliste öffnet.
 *  Probe Formsprache, vorläufig (17.09.2026). */
export function FilterKnoepfe({ filters, records, selections, gefiltert, onToggle, onClear }: Props) {
  const [offen, setOffen] = useState<string | null>(null);
  const bereich = useRef<HTMLDivElement>(null);
  const knoepfe = useRef<Record<string, HTMLButtonElement | null>>({});
  const listeId = useId();

  useEffect(() => {
    if (!offen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        knoepfe.current[offen]?.focus();
        setOffen(null);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!bereich.current?.contains(e.target as Node)) setOffen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [offen]);

  const offenerFilter = filters.find((f) => f.key === offen);

  // Die Liste steht im DOM hinter allen Knöpfen; ohne diesen Schritt führte
  // Tab erst durch die übrigen Knöpfe.
  useEffect(() => {
    if (offen) bereich.current?.querySelector<HTMLButtonElement>("[role=group] button")?.focus();
  }, [offen]);

  return (
    <div ref={bereich} className="relative">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5">
        {filters.map((f) => {
          const sel = selections[f.key] ?? [];
          const beschriftung = sel.length === 0 ? f.label : knopfText(f, sel);
          return (
            <button
              key={f.key}
              ref={(el) => {
                knoepfe.current[f.key] = el;
              }}
              type="button"
              aria-expanded={offen === f.key}
              aria-controls={listeId}
              aria-label={sel.length === 0 ? f.label : `${f.label}: ${beschriftung}`}
              onClick={() => setOffen((o) => (o === f.key ? null : f.key))}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-sm",
                sel.length > 0
                  ? "border-gold-700 bg-gold-100 font-semibold text-gold-700"
                  : "border-ink-line bg-white text-ink",
              )}
            >
              {beschriftung}
              <CaretDown size={12} aria-hidden className={cn("text-ink-muted transition-transform", offen === f.key && "rotate-180")} />
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-ink-muted tabular-nums" aria-live="polite">
        {gefiltert === records.length
          ? `${fmtInt(records.length)} Antworten`
          : `${fmtInt(gefiltert)} von ${fmtInt(records.length)} Antworten`}
      </p>

      {offenerFilter && (
        <AuswahlListe
          id={listeId}
          spec={offenerFilter}
          // Wie die Balken am Schreibtisch: jede Liste zählt unter den übrigen Filtern.
          records={applyFilters(records, filters, { ...selections, [offenerFilter.key]: [] })}
          selected={selections[offenerFilter.key] ?? []}
          onToggle={(idx) => onToggle(offenerFilter.key, idx)}
          onClear={() => onClear(offenerFilter.key)}
        />
      )}
    </div>
  );
}

function knopfText(f: FilterSpec, sel: number[]): string {
  const labels = f.type === "histogram_range" ? f.groups.map((g) => g.label) : f.labels;
  const name = (i: number) => (i === ohneAngabeIndex(f) ? "ohne Angabe" : labels[i]);
  return sel.length === 1 ? name(sel[0]) : `${name(sel[0])} +${sel.length - 1}`;
}

/** Jede Zeile trägt ihren Balken als Hintergrund. Die Breite skaliert auf die
 *  größte Zeile der Liste, „ohne Angabe“ eingeschlossen. Getönter Grund statt
 *  Gold-500 und Gold-700, damit die Schrift lesbar bleibt; die beiden Töne
 *  stehen als Grundstrich an der Unterkante. */
function AuswahlListe({ id, spec, records, selected, onToggle, onClear }: {
  id: string;
  spec: FilterSpec;
  records: Dataset["records"];
  selected: number[];
  onToggle: (idx: number) => void;
  onClear: () => void;
}) {
  const zeilen = useMemo<Bar[]>(() => {
    const bars = buildBars(records, spec);
    const ohne = records.filter((r) => istOhneAngabe(spec, r[spec.source])).length;
    return [...bars, { idx: ohneAngabeIndex(spec), label: "ohne Angabe", count: ohne, share: 0 }];
  }, [records, spec]);
  const max = Math.max(1, ...zeilen.map((z) => z.count));

  return (
    <div
      id={id}
      role="group"
      aria-label={spec.label}
      className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-ink-line bg-white shadow-lift"
    >
      <p className="px-3 pt-2 pb-1 text-xs font-semibold text-ink-muted">{spec.label}</p>
      <ul>
        {zeilen.map((z) => {
          const an = selected.includes(z.idx);
          return (
            <li key={z.idx}>
              <button
                type="button"
                aria-pressed={an}
                onClick={() => onToggle(z.idx)}
                className="relative grid min-h-11 w-full grid-cols-[1fr_auto] items-center gap-3 px-3 py-2 text-left text-sm"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0 left-0 border-b-2",
                    an ? "border-gold-700 bg-[#e6dcc2]" : "border-gold-500 bg-[#f4ecdc]",
                  )}
                  style={{ width: `${(z.count / max) * 100}%` }}
                />
                <span className={cn("relative flex items-center gap-1.5 text-ink", an && "font-semibold")}>
                  {z.label}
                  {an && <Check size={14} weight="bold" aria-hidden className="text-gold-700" />}
                </span>
                <span className={cn("relative tabular-nums", an ? "font-semibold text-gold-700" : "text-ink-muted")}>
                  {fmtInt(z.count)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-ink-line">
        <button
          type="button"
          onClick={onClear}
          disabled={selected.length === 0}
          className="min-h-11 w-full px-3 text-left text-sm font-semibold text-gold-700 disabled:text-ink-muted"
        >
          Auswahl aufheben
        </button>
      </div>
    </div>
  );
}
