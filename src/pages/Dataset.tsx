import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { loadDataset, loadManifest, type Dataset as Ds, type ManifestEntry } from "@/lib/data";
import {
  activeCount,
  applyFilters,
  clearAll,
  readSelections,
  toggleOption,
  writeSelections,
} from "@/lib/filters";
import { KategorieZeile, Kennzahl } from "@/components/ui";
import { CARD_KIND } from "@/lib/cardKind";
import { themenfarbe, zeichnung } from "@/lib/themenfarbe";
import { Section } from "@/components/Section";
import { FilterChart } from "@/components/FilterChart";
import { FilterKnoepfe } from "@/components/FilterKnoepfe";
import { OffeneThemen } from "@/components/OffeneThemen";
import { Leiste, kapitelAnker } from "@/components/Leiste";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { PressSection } from "@/components/press/PressSection";
import { HELP, HelpIcon } from "@/components/HelpIcon";
import { fmtInt } from "@/lib/format";
import { basiszeile } from "@/lib/basis";

export function Dataset() {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<Ds | null>(null);
  const [entry, setEntry] = useState<ManifestEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!id) return;
    setDataset(null);
    setEntry(null);
    setError(null);
    loadManifest()
      .then(async (m) => {
        const e = m.datasets.find((d) => d.id === id);
        if (!e) throw new Error(`Datensatz "${id}" nicht gefunden.`);
        setEntry(e);
        const ds = await loadDataset(e.file);
        setDataset(ds);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const selections = useMemo(
    () => (dataset ? readSelections(searchParams, dataset.filters) : {}),
    [searchParams, dataset],
  );

  const filteredRecords = useMemo(
    () => (dataset ? applyFilters(dataset.records, dataset.filters, selections) : []),
    [dataset, selections],
  );

  if (error) {
    return (
      <div className="mx-auto max-w-screen-md px-4 sm:px-6 py-16">
        <p className="text-red-700 bg-red-50 rounded-md px-4 py-3 border border-red-100">
          {error}
        </p>
        <Link to="/" className="inline-flex items-center gap-1.5 mt-6 text-red-700 underline decoration-dotted">
          <ArrowLeft aria-hidden className="shrink-0" />
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  if (!dataset || !entry) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-10 space-y-6">
        <div className="h-10 w-2/3 rounded-md bg-white/60 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-white/60 border border-ink-line animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-lg bg-white/60 border border-ink-line animate-pulse" />
      </div>
    );
  }

  const sortedSections = [...dataset.sections].sort((a, b) => a.order - b.order);
  const active = activeCount(selections);
  const style = CARD_KIND[dataset.kind === "statistik" ? "statistik" : dataset.kind === "eigen" ? "eigen" : "umfrage"];

  const updateSelections = (next: typeof selections) =>
    setSearchParams(writeSelections(searchParams, next, dataset.filters), {
      replace: true,
      preventScrollReset: true,
    });

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
      {/* Kopfband über die volle Breite in der Themenfarbe. 50vw zählt eine
          sichtbare Scrollleiste mit, deshalb body { overflow-x: clip }. */}
      <header
        className="relative -mx-[calc(50vw-50%)] px-[calc(50vw-50%)] py-8 text-cream sm:py-12"
        style={{ background: themenfarbe(entry.id) }}
      >
        {zeichnung(entry.id) && (
          // Hintergrundbild statt <img>: unter lg ausgeblendet und dann nicht geladen.
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
            <div
              className="absolute -right-28 bottom-0 h-full w-[30rem] bg-contain xl:-right-24 xl:w-[46rem] bg-right-bottom bg-no-repeat opacity-80"
              style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${zeichnung(entry.id)})` }}
            />
          </div>
        )}
        <Link
          to="/"
          className="relative inline-flex items-center gap-1.5 text-sm font-semibold text-cream/85 hover:text-cream"
        >
          <ArrowLeft aria-hidden className="shrink-0" />
          Data Hub
        </Link>
        <KategorieZeile icon={style.icon} className="relative mt-6 flex text-gold-200">
          {dataset.kind === "statistik"
            ? [style.label, dataset.meta.source].filter(Boolean).join(" · ")
            : `${style.label} ${dataset.meta.year}`}
        </KategorieZeile>
        <h1 className="headline relative mt-2 text-display-2 sm:text-display-1">{dataset.meta.title}</h1>
        {dataset.meta.description && (
          <p className="relative mt-4 max-w-prose text-lg">{dataset.meta.description}</p>
        )}
        <div className="relative mt-8 flex flex-wrap gap-x-8 gap-y-5 sm:gap-x-12">
          {dataset.kind === "statistik" ? (
            <>
              <Kennzahl wert={dataset.meta.year} label="Stand" className="text-gold-200" labelClassName="text-cream" />
              <Kennzahl wert={fmtInt(entry.n)} label="Datenpunkte" className="text-gold-200" labelClassName="text-cream" />
            </>
          ) : (
            <>
              <Kennzahl wert={dataset.meta.year} label="Erhebungsjahr" className="text-gold-200" labelClassName="text-cream" />
              <Kennzahl
                wert={fmtInt(filteredRecords.length)}
                label={
                  filteredRecords.length === dataset.records.length
                    ? "Antworten"
                    : `Antworten, gefiltert von ${fmtInt(dataset.records.length)}`
                }
                className="text-gold-200"
                labelClassName="text-cream"
              />
            </>
          )}
          <Kennzahl wert={sortedSections.length} label="Themenbereiche" className="text-gold-200" labelClassName="text-cream" />
        </div>
      </header>

      {sortedSections.length > 1 && (
        <nav aria-label="Kapitel" className="border-b border-ink-line py-5">
          <ol className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            {sortedSections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${kapitelAnker(s.id)}`}
                  className="text-red-700 underline decoration-red-700/30 underline-offset-4 hover:decoration-red-700"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <Leiste kapitel={sortedSections}>
        {dataset.filters.length > 0 && (
          <>
            <div className="py-2.5 sm:hidden">
              <FilterKnoepfe
                filters={dataset.filters}
                records={dataset.records}
                selections={selections}
                gefiltert={filteredRecords.length}
                onToggle={(key, idx) => updateSelections(toggleOption(selections, key, idx))}
                onClear={(key) => updateSelections({ ...selections, [key]: [] })}
              />
            </div>
            <div className="hidden py-2.5 sm:block">
              <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(110px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
                {dataset.filters.map((f) => {
                  // Each filter sees the records that satisfy ALL other filters
                  // — so age bars react when "Moosburger" is selected, etc.
                  const otherSelections = { ...selections, [f.key]: [] };
                  const recordsForThisFilter = applyFilters(
                    dataset.records,
                    dataset.filters,
                    otherSelections,
                  );
                  return (
                    <FilterChart
                      key={f.key}
                      spec={f}
                      records={recordsForThisFilter}
                      selected={selections[f.key] ?? []}
                      onToggle={(idx) =>
                        updateSelections(toggleOption(selections, f.key, idx))
                      }
                    />
                  );
                })}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-3 text-[11px] text-ink-muted">
                <span>Wer hat geantwortet?</span>
                {active > 0 ? (
                  <button
                    type="button"
                    onClick={() => updateSelections(clearAll())}
                    className="font-semibold text-ink underline decoration-dotted hover:text-gold-700"
                  >
                    alle Filter zurücksetzen
                  </button>
                ) : (
                  <span>Balken antippen oder klicken zum Filtern</span>
                )}
              </div>
            </div>
          </>
        )}
      </Leiste>

      {/* Sections */}
      <div className="divide-y divide-ink-line">
        {sortedSections.map((s) => (
          <Section key={s.id} id={kapitelAnker(s.id)} title={s.title} text={s.text}>
            {s.type === "open_themes" && s.themes && (
              <OffeneThemen themen={s.themes} farbe={themenfarbe(entry.id)} />
            )}
            {(s.charts ?? []).length === 0 && !s.themes && (
              <p className="text-ink-muted text-sm italic">
                Für diesen Abschnitt liegen noch keine Visualisierungen vor.
              </p>
            )}
            {(s.charts ?? []).map((c) => (
              <div
                key={c.id}
                className="rounded-xl bg-white border border-ink-line shadow-soft p-4 sm:p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    {"title" in c && c.title && (
                      <h3 className="font-display text-lg font-semibold leading-snug text-ink">
                        {c.title}
                      </h3>
                    )}
                    {/* Worauf sich die Zahlen beziehen, zählt mit den Filtern mit. */}
                    {basiszeile(c, filteredRecords) && (
                      <p className="mt-0.5 text-sm text-ink-muted tabular-nums">
                        {basiszeile(c, filteredRecords)}
                      </p>
                    )}
                  </div>
                  {HELP[c.type] && <HelpIcon explanation={HELP[c.type]} />}
                </div>
                {/* Survey charts read from records and need the "no matches"
                    guard. Statistik charts carry their data inline, so an
                    empty records[] is the normal case and not an error. */}
                {dataset.kind !== "statistik" && filteredRecords.length === 0 ? (
                  <p className="text-ink-muted text-sm py-8 text-center">
                    Keine Antworten passen zum aktuellen Filter.
                  </p>
                ) : (
                  <ChartRenderer
                    spec={c}
                    records={filteredRecords}
                    codebook={dataset.codebook}
                    suppressTitle
                  />
                )}
              </div>
            ))}
          </Section>
        ))}
      </div>

      {dataset.press && dataset.press.length > 0 && (
        <PressSection press={dataset.press} />
      )}
    </div>
  );
}
