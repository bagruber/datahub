import { useEffect, useState } from "react";
import { loadManifest, type Manifest } from "@/lib/data";
import { DatasetCard } from "@/components/DatasetCard";
import { CARD_KIND } from "@/lib/cardKind";

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

      {/* Eigenständige Anwendungen, keine Datensätze aus dem Manifest.
          Grundton wie die anderen „Eigene Auswertung", Aufbau in KartenCard. */}
      <section className="pb-16">
        {/* Überschrift benennt die Form, der Kicker auf der Card die
            Herkunft — sonst stünde zweimal dasselbe. */}
        <h2 className="eyebrow mb-4">Karten</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KartenCard
            href={`${import.meta.env.BASE_URL}baumkarte/`}
            titel="Baumkarte"
            zeile="2.868.813 Einzelbäume rund um Moosburg"
          />
          <KartenCard
            href={`${import.meta.env.BASE_URL}historisch/`}
            titel="Moosburg historisch"
            zeile="Acht Kartenausgaben von 1960 bis heute, übereinandergelegt"
          />
        </div>
      </section>
    </div>
  );
}

/** Card einer eigenständigen Kartenanwendung: eigener Build unter /data/…/,
    deshalb ein normaler Link statt einer Route des Routers. */
function KartenCard({ href, titel, zeile }: { href: string; titel: string; zeile: string }) {
  return (
    <a
      href={href}
      className={`group block rounded-xl border p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift ${CARD_KIND.eigen.surface}`}
    >
      <p className={CARD_KIND.eigen.eyebrow}>{CARD_KIND.eigen.label}</p>
      <h3
        className={`headline mt-1 mb-2 flex items-center gap-1.5 text-xl transition-colors sm:text-2xl ${CARD_KIND.eigen.titleHover}`}
      >
        {titel}
        <svg
          width="11"
          height="11"
          viewBox="0 0 11 11"
          fill="none"
          aria-hidden
          className="mt-0.5 shrink-0 opacity-45"
        >
          <path
            d="M2.5 8.5 8.5 2.5M4 2.5h4.5V7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </h3>
      <p className={`text-sm ${CARD_KIND.eigen.meta}`}>{zeile}</p>
    </a>
  );
}
