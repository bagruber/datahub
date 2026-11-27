import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadManifest, type Manifest, type ManifestEntry } from "@/lib/data";
import { DatasetCard, Kachel } from "@/components/DatasetCard";
import { CARD_KIND } from "@/lib/cardKind";
import { SeitenKopf } from "@/components/ui";
import { useTitel } from "@/lib/useTitel";

export function Home() {
  useTitel();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManifest().then(setManifest).catch((e: Error) => setError(e.message));
  }, []);

  // Der Router springt nicht selbst zu #karten; erst nach dem Manifest, weil
  // die Kacheln darüber sonst die Position noch verschieben.
  const { hash } = useLocation();
  useEffect(() => {
    if (hash && (manifest || error)) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash, manifest, error]);

  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
      <div className="py-10 sm:py-16">
        <SeitenKopf
          titel="Was Moosburg sagt, sichtbar gemacht."
          script="nachgefragt"
          zeichnung="sketches/buechereiA.svg"
          className="max-w-3xl text-display-2 sm:text-display-1"
        >
          Bürgerbefragungen, offene Daten und Auswertungen aus Moosburg, kompakt und ohne Anmeldung.
        </SeitenKopf>
      </div>

      {error && (
        <p className="mb-16 text-red-700 bg-red-50 rounded-md px-4 py-3 border border-red-100">
          Fehler beim Laden: {error}
        </p>
      )}
      {!manifest && !error && (
        <div className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl bg-white/60 border border-ink-line animate-pulse"
            />
          ))}
        </div>
      )}
      {/* Einzelne Befragungen mit allen Antworten, getrennt von dem, was
          andere erhoben haben: amtliche Statistik, Wahlen, Studien. */}
      {manifest && (
        <>
          <Gruppe
            titel="Umfragen"
            satz="Einzelne Befragungen, jede mit allen Antworten und Filtern."
            eintraege={manifest.datasets.filter((d) => !d.kind || d.kind === "survey")}
          />
          <Gruppe
            titel="Statistik, Wahlen und Studien"
            satz="Von anderen erhoben, hier aufbereitet."
            eintraege={manifest.datasets.filter((d) => d.kind === "statistik" || d.kind === "studie")}
          />
        </>
      )}

      {/* Eigenständige Anwendungen, keine Datensätze aus dem Manifest.
          Grundton wie die anderen „Eigene Auswertung", Aufbau in KartenCard. */}
      <section id="karten" className="scroll-mt-[calc(var(--kopf-hoehe)+1rem)] pb-16">
        {/* Überschrift benennt die Form, die Kategoriezeile der Kachel die
            Herkunft — sonst stünde zweimal dasselbe. */}
        <h2 className="headline text-2xl sm:text-3xl mb-5">Karten</h2>
        <div className="grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <KartenCard
            href={`${import.meta.env.BASE_URL}baumkarte/`}
            titel="Baumkarte"
            satz="Alle Einzelbäume rund um Moosburg."
            zahl="2.868.813"
            einheit="Einzelbäume"
            variante={0}
          />
          <KartenCard
            href={`${import.meta.env.BASE_URL}historisch/`}
            titel="Historische Karten"
            satz="Acht Kartenausgaben von 1960 bis heute, übereinandergelegt."
            zahl="8"
            einheit="Kartenausgaben"
            variante={1}
          />
          <KartenCard
            href={`${import.meta.env.BASE_URL}foodhub/`}
            titel="Speisekarten"
            satz="Aus den Karten von 16 Häusern, jede mit Quelle und Datum."
            zahl="1.714"
            einheit="Gerichte"
            variante={2}
          />
        </div>
      </section>
    </div>
  );
}

function Gruppe({ titel, satz, eintraege }: { titel: string; satz: string; eintraege: ManifestEntry[] }) {
  if (eintraege.length === 0) return null;
  return (
    <section className="pb-16">
      <h2 className="headline text-2xl sm:text-3xl">{titel}</h2>
      <p className="mt-1 mb-5 text-ink-muted">{satz}</p>
      <div className="grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {eintraege.map((d, i) => (
          <DatasetCard key={d.id} entry={d} variante={i} />
        ))}
      </div>
    </section>
  );
}

/** Kachel einer eigenständigen Kartenanwendung: eigener Build unter /data/…/,
    deshalb ein normaler Link statt einer Route des Routers. */
function KartenCard({ href, titel, satz, zahl, einheit, variante }: {
  href: string;
  titel: string;
  satz: string;
  zahl: string;
  einheit: string;
  variante: number;
}) {
  return (
    <Kachel
      kind="eigen"
      variante={variante}
      zeile={CARD_KIND.eigen.label}
      titel={titel}
      satz={satz}
      zahl={zahl}
      einheit={einheit}
      extern
      link={(className, children) => (
        <a href={href} className={className}>
          {children}
        </a>
      )}
    />
  );
}
