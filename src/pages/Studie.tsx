import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpenText } from "@phosphor-icons/react";
import { KategorieZeile, Kennzahl } from "@/components/ui";
import { Leiste, kapitelAnker } from "@/components/Leiste";
import { BarH } from "@/components/charts/BarH";
import { DivergingLikert } from "@/components/charts/DivergingLikert";
import { themenfarbe } from "@/lib/themenfarbe";
import { EINZEL, GITTER } from "@/lib/palette";
import { fuelle, inline, type Block, type Funktion, type Studie as StudieDaten, type Wert } from "@/lib/studie";

/** Seite einer Studie: ein Bericht in Kapiteln, gelesen von oben nach unten.
 *  Kopfband, Kapitelleiste und Diagrammkarten wie auf den Datensatzseiten;
 *  keine Filter, weil die Studie nur Aggregate enthält. */
export function Studie({ studie }: { studie: StudieDaten }) {
  const { meta, werte, kapitel } = studie;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
      <header
        className="relative -mx-[calc(50vw-50%)] px-[calc(50vw-50%)] py-8 text-cream sm:py-12"
        style={{ background: themenfarbe(meta.id) }}
      >
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cream/85 hover:text-cream">
          <ArrowLeft aria-hidden className="shrink-0" />
          Data Hub
        </Link>
        <KategorieZeile icon={BookOpenText} className="mt-6 flex text-gold-200">
          {studie.zeile}
        </KategorieZeile>
        <h1 className="headline mt-2 text-display-2 sm:text-display-1">{meta.title}</h1>
        <p className="mt-4 max-w-prose text-lg">{meta.description}</p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-5 sm:gap-x-12">
          {studie.kennzahlen.map((k) => (
            <Kennzahl
              key={k.label}
              wert={fuelle(k.wert, werte)}
              label={k.label}
              className="text-gold-200"
              labelClassName="text-cream"
            />
          ))}
        </div>
      </header>

      <nav aria-label="Kapitel" className="border-b border-ink-line py-5">
        <ol className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          {kapitel.map((k, i) => (
            <li key={k.id}>
              <a
                href={`#${kapitelAnker(k.id)}`}
                className="text-red-700 underline decoration-red-700/30 underline-offset-4 hover:decoration-red-700"
              >
                <span className="tabular-nums text-ink-muted">{i + 1}</span> {k.titel}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Leiste kapitel={kapitel.map((k) => ({ id: k.id, title: k.titel }))} />

      <div className="max-w-3xl divide-y divide-ink-line">
        {kapitel.map((k, i) => (
          <section
            key={k.id}
            id={kapitelAnker(k.id)}
            className="py-10 sm:py-14"
            style={{ scrollMarginTop: "var(--leiste-unten, var(--kopf-hoehe))" }}
          >
            {k.zeile && <p className="text-sm font-semibold text-red-700">{k.zeile}</p>}
            <h2 className="headline mt-1 mb-6 text-2xl sm:text-3xl">
              <span className="mr-3 tabular-nums text-ink-muted">{i + 1}</span>
              {k.titel}
            </h2>
            <div className="space-y-8">
              {k.bloecke.map((b, j) => (
                <BlockAnsicht key={j} block={b} studie={studie} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Inline({ text, werte, as: Tag = "span", className }: {
  text: string;
  werte: Record<string, Wert>;
  as?: "span" | "p" | "li";
  className?: string;
}) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: inline(text, werte) }} />;
}

const KARTE = "rounded-xl border border-ink-line bg-white p-4 shadow-soft sm:p-6";

function BlockAnsicht({ block: b, studie }: { block: Block; studie: StudieDaten }) {
  const w = studie.werte;
  switch (b.typ) {
    case "text":
      return (
        <div className="max-w-prose space-y-4 text-ink-soft">
          {b.text.split("\n\n").map((absatz, i) => (
            <Inline key={i} as="p" text={absatz} werte={w} />
          ))}
        </div>
      );

    case "befunde":
      return (
        <ol className="grid gap-x-10 sm:grid-cols-2">
          {b.eintraege.map((e) => (
            <li key={e.kern} className="border-t border-ink-line py-4">
              <p className="font-display text-xl font-semibold leading-snug text-ink">{e.kern}</p>
              <Inline as="p" text={e.text} werte={w} className="mt-1.5 text-ink-soft" />
            </li>
          ))}
        </ol>
      );

    case "teilprojekte":
      return (
        <ul className="grid gap-3 sm:grid-cols-3">
          {b.eintraege.map((t) => (
            <li key={t.titel}>
              <a href={`#${kapitelAnker(t.kapitel)}`} className={`group block h-full ${KARTE} hover:border-ink-muted`}>
                <span className="block font-display text-xl font-semibold group-hover:text-red-700">{t.titel}</span>
                <span className="mt-2 block text-sm text-ink-soft">{t.frage}</span>
              </a>
            </li>
          ))}
        </ul>
      );

    case "hinweis":
      return (
        <aside className="rounded-xl border border-ink-line bg-cream-dark/70 px-5 py-4">
          <p className="text-sm font-semibold text-ink">{b.titel}</p>
          <Inline as="p" text={b.text} werte={w} className="mt-1 text-sm text-ink-soft" />
        </aside>
      );

    case "zeitleiste":
      return (
        <ol>
          {b.eintraege.map((e) => (
            <li key={e.wann} className="grid gap-x-6 border-t border-ink-line py-3 sm:grid-cols-[9.5rem_1fr]">
              <span className="font-semibold tabular-nums text-ink">{e.wann}</span>
              <Inline text={e.was} werte={w} className="text-ink-soft" />
            </li>
          ))}
        </ol>
      );

    case "methoden":
      return (
        <div>
          <h3 className="mb-2 font-display text-lg font-semibold">Wer wie befragt wurde</h3>
          <ul>
            {b.zeilen.map((z, i) => (
              <li key={i} className="grid gap-x-6 border-t border-ink-line py-3 sm:grid-cols-[9.5rem_1fr_13rem]">
                <span className="text-sm font-semibold text-red-700">{z.teil}</span>
                <span className="text-ink">{z.methode}</span>
                <Inline text={z.wer} werte={w} className="text-sm text-ink-soft sm:text-right" />
              </li>
            ))}
          </ul>
        </div>
      );

    case "verteilung":
      return (
        <div className={KARTE}>
          <h3 className="font-display text-lg font-semibold leading-snug">{b.titel}</h3>
          <p className="mt-0.5 mb-4 text-sm tabular-nums text-ink-muted">{fuelle(b.basis, w)}</p>
          <Verteilung zeilen={b.zeilen} links={b.links} rechts={b.rechts} />
          <p className="mt-2 text-xs text-ink-muted">
            {b.zeilen.map((z) => `${z.label}: ${z.pole}`).join(" · ")}. {b.quelle}.
          </p>
        </div>
      );

    case "ranglisten":
      return (
        <div className={`grid gap-4 ${b.eintraege.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {b.eintraege.map((r) => (
            <Rangliste key={r.titel} {...r} />
          ))}
        </div>
      );

    case "zitate":
      return (
        <figure>
          <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {b.eintraege.map((z) => (
              <blockquote key={z} className="font-display text-lg leading-snug text-ink">
                „{z}“
              </blockquote>
            ))}
          </div>
          <figcaption className="mt-4 text-sm text-ink-muted">{b.herkunft}</figcaption>
        </figure>
      );

    case "personas":
      return (
        <ul className="grid gap-4 sm:grid-cols-2">
          {b.eintraege.map((p) => (
            <li key={p.name} className={KARTE}>
              <p className="text-sm font-semibold text-red-700">{p.beduerfnis}</p>
              <p className="mt-1 font-display text-2xl font-semibold">{p.name}</p>
              <p className="text-sm text-ink-muted">{p.steckbrief}</p>
              <p className="mt-3 font-display text-lg leading-snug">„{p.zitat}“</p>
              <p className="mt-3 text-sm text-ink-soft">{p.nutzung}</p>
              <dl className="mt-3 grid gap-3 text-sm">
                <div>
                  <dt className="font-semibold">Sucht</dt>
                  <dd className="text-ink-soft">{p.sucht.join(" · ")}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Wünscht sich</dt>
                  <dd className="text-ink-soft">{p.wuenscht.join(" · ")}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      );

    case "spalten":
      return (
        <div className={KARTE}>
          <h3 className="mb-4 font-display text-lg font-semibold">{b.titel}</h3>
          <div className={`grid gap-x-6 gap-y-5 ${b.eintraege.length > 3 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
            {b.eintraege.map((s) => (
              <div key={s.kopf}>
                <p className="border-b border-ink-line pb-1.5 text-sm font-semibold">{s.kopf}</p>
                <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                  {s.punkte.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case "diagramm":
      return (
        <div className={KARTE}>
          <h3 className="font-display text-lg font-semibold leading-snug">{b.titel}</h3>
          <p className="mt-0.5 mb-4 text-sm tabular-nums text-ink-muted">{fuelle(b.basis, w)}</p>
          {b.art === "umsetzung" ? (
            <Umsetzung funktionen={studie.daten.befragung.funktionen} n={studie.daten.befragung.n} />
          ) : (
            <Funktionen
              funktionen={studie.daten.befragung.funktionen}
              item={b.item!}
              umkehren={b.umkehren}
              links={b.links!}
              rechts={b.rechts!}
            />
          )}
        </div>
      );

    case "liste":
      return (
        <div>
          <h3 className="mb-2 font-display text-lg font-semibold">{b.titel}</h3>
          <ul className="space-y-1 text-sm text-ink-soft">
            {b.eintraege.map((e) => (
              <Inline key={e} as="li" text={e} werte={w} />
            ))}
          </ul>
        </div>
      );

    case "aufklappbar":
      return (
        <details>
          <summary className="w-fit cursor-pointer font-semibold text-red-700 hover:text-ink">{b.titel}</summary>
          <div className="mt-6 space-y-8">
            {b.bloecke.map((k, i) => (
              <BlockAnsicht key={i} block={k} studie={studie} />
            ))}
          </div>
        </details>
      );
  }
}

/** Gezählte Nennungen mit einem Balken relativ zum größten Wert der Liste.
 *  Keine Prozente: Nennungen sind keine Personen, wer mehreres nennt, zählt mehrfach. */
function Rangliste({ titel, basis, quelle, zeilen }: {
  titel: string;
  basis: string;
  quelle: string;
  zeilen: { label: string; wert: number }[];
}) {
  const max = Math.max(...zeilen.map((z) => z.wert));
  return (
    <div className={KARTE}>
      <h3 className="mb-3 font-display text-lg font-semibold leading-snug">{titel}</h3>
      <ol className="space-y-2.5">
        {zeilen.map((z) => (
          <li key={z.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink-soft">{z.label}</span>
              <span className="font-semibold tabular-nums">{z.wert}</span>
            </div>
            <div className="mt-1 h-1.5" style={{ background: GITTER }}>
              <div className="h-full" style={{ width: `${(100 * z.wert) / max}%`, background: EINZEL }} />
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-ink-muted">
        {basis} {quelle}.
      </p>
    </div>
  );
}

function Umsetzung({ funktionen, n }: { funktionen: Funktion[]; n: number }) {
  const daten = useMemo(
    () => ({
      n,
      rows: funktionen.map((f) => ({
        label: f.label,
        count: f.umsetzung.ja,
        share: f.umsetzung.ja / (f.umsetzung.ja + f.umsetzung.nein),
      })),
    }),
    [funktionen, n],
  );
  return <BarH records={[]} codebook={{}} source="" daten={daten} />;
}

/** Die Likert-Komponente zählt aus Records. Aus Zählungen entstehen hier im
 *  Speicher Zeilen mit je einem Feld, die nur die Verteilung wiedergeben,
 *  keine Personen. Der erste Eintrag steht oben. */
function LikertAusZaehlung({ zeilen, umkehren, links, rechts }: {
  zeilen: { id: string; label: string; zaehlung: number[] }[];
  umkehren?: boolean;
  links: string;
  rechts: string;
}) {
  const records = useMemo(
    () =>
      zeilen.flatMap((z) =>
        z.zaehlung.flatMap((anzahl, stufe) => Array.from({ length: anzahl }, () => ({ [z.id]: stufe + 1 }))),
      ),
    [zeilen],
  );
  return (
    <DivergingLikert
      records={records}
      codebook={{}}
      // DivergingLikert setzt den letzten Eintrag nach oben.
      items={zeilen.map((z) => ({ source: z.id, label: z.label })).reverse()}
      scale={5}
      endpoints={{ left: links, right: rechts }}
      invertItem={umkehren ? () => true : undefined}
    />
  );
}

function Verteilung({ zeilen, links, rechts }: {
  zeilen: { label: string; zaehlung: number[] }[];
  links: string;
  rechts: string;
}) {
  const mitId = useMemo(() => zeilen.map((z, i) => ({ ...z, id: `z${i}` })), [zeilen]);
  return <LikertAusZaehlung zeilen={mitId} links={links} rechts={rechts} />;
}

function Funktionen({ funktionen, item, umkehren, links, rechts }: {
  funktionen: Funktion[];
  item: string;
  umkehren?: boolean;
  links: string;
  rechts: string;
}) {
  const zeilen = useMemo(
    () => funktionen.map((f) => ({ id: f.id, label: f.label, zaehlung: f.items[item] })),
    [funktionen, item],
  );
  return <LikertAusZaehlung zeilen={zeilen} umkehren={umkehren} links={links} rechts={rechts} />;
}
