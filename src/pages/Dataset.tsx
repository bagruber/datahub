import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { loadDataset, loadManifest, type Dataset as Ds, type ManifestEntry } from "@/lib/data";
import {
  activeCount,
  applyFilters,
  clearAll,
  readSelections,
  toggleOption,
  writeSelections,
} from "@/lib/filters";
import { Stat } from "@/components/Stat";
import { Section } from "@/components/Section";
import { FilterChart } from "@/components/FilterChart";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { PressSection } from "@/components/press/PressSection";
import { HELP, HelpIcon } from "@/components/HelpIcon";
import { fmtInt } from "@/lib/format";

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
        <Link to="/" className="inline-block mt-6 text-red-700 underline decoration-dotted">
          ← Zurück zur Übersicht
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

  const updateSelections = (next: typeof selections) =>
    setSearchParams(writeSelections(searchParams, next, dataset.filters), {
      replace: true,
      preventScrollReset: true,
    });

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
      {/* Hero */}
      <header className="py-10 sm:py-14">
        <Link to="/" className="eyebrow text-ink-muted hover:text-ink">
          ← Datenhub
        </Link>
        <h1 className="headline text-display-2 sm:text-display-1 mt-3">
          {dataset.meta.title}
        </h1>
        {dataset.meta.description && (
          <p className="mt-4 text-ink-soft text-lg max-w-prose">
            {dataset.meta.description}
          </p>
        )}
      </header>

      {/* Key facts — first, before filters. Layout differs by dataset kind:
          surveys show respondents; statistik shows the source. */}
      {dataset.kind === "statistik" ? (
        <div className="grid gap-4 sm:grid-cols-3 pb-6">
          <Stat label="Stand" value={String(dataset.meta.year)} />
          <Stat
            label="Quelle"
            value={dataset.meta.source ?? "—"}
            sub="Amtliche Statistik"
          />
          <Stat label="Themenbereiche" value={String(sortedSections.length)} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 pb-6">
          <Stat label="Erhebungsjahr" value={String(dataset.meta.year)} />
          <Stat
            label="Antworten"
            value={fmtInt(filteredRecords.length)}
            sub={
              filteredRecords.length === dataset.records.length
                ? "Stichprobengröße"
                : `gefiltert von ${fmtInt(dataset.records.length)}`
            }
          />
          <Stat label="Themenbereiche" value={String(sortedSections.length)} />
        </div>
      )}

      {/* Sticky filter strip — compact vertical bars, always reachable */}
      {dataset.filters.length > 0 && (
        <div className="sticky top-[57px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-cream/95 backdrop-blur border-y border-ink-line">
          <div className="py-2.5">
            <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(86px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(110px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
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
                  className="font-semibold text-red-700 hover:text-red-900 underline decoration-dotted"
                >
                  alle Filter zurücksetzen
                </button>
              ) : (
                <span className="hidden sm:inline">
                  Balken antippen oder klicken zum Filtern
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="divide-y divide-ink-line">
        {sortedSections.map((s) => (
          <Section key={s.id} eyebrow={`Kapitel ${s.order}`} title={s.title} text={s.text}>
            {(s.charts ?? []).length === 0 && (
              <p className="text-ink-muted text-sm italic">
                Für diesen Abschnitt liegen noch keine Visualisierungen vor.
              </p>
            )}
            {(s.charts ?? []).map((c) => (
              <div
                key={c.id}
                className="rounded-xl bg-white border border-ink-line shadow-soft p-4 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  {"title" in c && c.title && (
                    <h3 className="font-semibold text-ink leading-snug">{c.title}</h3>
                  )}
                  {HELP[c.type] && <HelpIcon explanation={HELP[c.type]} />}
                </div>
                {filteredRecords.length === 0 ? (
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
