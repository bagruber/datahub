import { useEffect, useState } from "react";
import { loadManifest, type Manifest } from "@/lib/data";
import { DatasetCard } from "@/components/DatasetCard";

export function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManifest().then(setManifest).catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
      <section className="py-10 sm:py-16 max-w-3xl">
        <p className="eyebrow mb-3">Data Hub</p>
        <h1 className="headline text-display-2 sm:text-display-1">
          Was Moosburg sagt, sichtbar gemacht.
        </h1>
        <p className="mt-5 text-ink-soft text-lg max-w-prose">
          Bürgerbefragungen, offene Daten und Auswertungen aus der Stadt — kompakt,
          nachvollziehbar und ohne Anmeldung.
        </p>
      </section>

      <section className="pb-16">
        <h2 className="eyebrow mb-4">Datensätze</h2>
        {error && (
          <p className="text-red-700 bg-red-50 rounded-md px-4 py-3 border border-red-100">
            Fehler beim Laden: {error}
          </p>
        )}
        {!manifest && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-36 rounded-xl bg-white/60 border border-ink-line animate-pulse"
              />
            ))}
          </div>
        )}
        {manifest && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manifest.datasets.map((d) => (
              <DatasetCard key={d.id} entry={d} />
            ))}
          </div>
        )}
      </section>

      {/* Eigenständige Anwendung, kein Datensatz aus dem Manifest: eigener
          Build unter /data/baumkarte/, deshalb ein normaler Link statt einer
          Route des Routers. */}
      <section className="pb-16">
        <h2 className="eyebrow mb-4">Karten</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href={`${import.meta.env.BASE_URL}baumkarte/`}
            className="group block rounded-xl border border-ink-line bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <p className="eyebrow text-ink-muted">Einzelbäume</p>
            <h3 className="headline mt-1 mb-2 text-xl transition-colors group-hover:text-red-700 sm:text-2xl">
              Baumkarte
            </h3>
            <p className="text-sm text-ink-muted">
              2.868.813 Bäume zwischen Moosburg und Landshut
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
