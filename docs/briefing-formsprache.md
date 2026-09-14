# Briefing: Formsprache-Probe im Data Hub

*Angelegt am 14.09.2026. Status: **Probe, nicht freigegeben.** Alles hier setzt
vorläufige Entscheidungen um; nichts davon ist Kanon.*

Dieses Briefing beschreibt, wie der Data Hub (`moosburg.eu/data/`) probeweise auf die neue
Formsprache umgestellt wird. Es ist so geschrieben, dass eine neue Sitzung ohne Vorwissen
loslegen kann: zuerst die Abschnitte 1 bis 3 ganz lesen, dann die Arbeitspakete der Reihe
nach.

**Reihenfolge.** Nach dem Haushalt kommen die Portalseite
(`../moosburg-eu/docs/briefing-formsprache-portal.md`) und der Stadtrat
(`../council/docs/briefing-formsprache.md`), dann dieses Projekt. Deren Ergebnisse vorher
lesen, falls sie vorliegen.

---

## 1. Worum es geht

In zwei Vorschlagsrunden (11. und 14.09.2026) ist für alle Moosburg-Projekte eine
einheitlichere Formsprache entstanden. Am 14.09.2026 hat Benedict **vorläufige
Entscheidungen** getroffen, haushaltvis hat sie als Erstes erprobt. Der Data Hub hat
denselben Stack wie der Haushalt (Vite, React 19, TypeScript, Tailwind 4). Die Bausteine der
Haushalt-Probe lassen sich deshalb fast unverändert übernehmen; die Arbeit liegt in der
Übersetzung auf die Elemente des Data Hub.

**Die Elemente:**

- die Startseite mit Datensatz-Kacheln und den Kacheln der Karten
- die Datensatzseiten: Kopf, Kennzahlen, klebende Filterleiste, Kapitel, 15 Diagrammarten,
  Pressestimmen
- die Über-Seite, Kopf und Fuß
- die eigenständigen Karten unter `/data/` (Baumkarte, Moosburg historisch, Speisekarten)
  und die Wahlen. Sie liegen in eigenen Repos und sind **nicht** Teil dieser Probe;
  Abschnitt 6 hält fest, was für sie folgt.

Die Data-Hub-Kacheln sind auf der Vorschlagsseite eigens entworfen und vorläufig
entschieden: Farbklecks, abgehobene Kategorie, die Anzahl als eigene Zeile.

### Quellen, in dieser Reihenfolge lesen

| Quelle | Wozu |
|---|---|
| `../moosburg-design/docs/formsprache/ENTSCHEIDUNGEN.md` | Das Protokoll; Abschnitt 4 hat alle Werte. **Maßgeblich**, falls Briefing und Protokoll auseinanderlaufen. |
| `../haushaltvis/docs/formsprache-probe/ERGEBNIS.md` | Erste Probe: was trug, was nicht, Benedicts Rückmeldung. |
| Branch `probe/formsprache` in `../haushaltvis` | **Vorlage zum Übernehmen:** `src/components/ui.tsx` (`Klecks`, `KategorieZeile`, `Kennzahl`, `Rose`, `SeitenTitel`, `SeitenKopf`, `SketchGround`, `Stripe`), `src/components/Header.tsx` (Kopfzeile, Disclosure, Blatt), `src/lib/kategorien.ts` und `src/lib/colors.ts` (Töne), `src/index.css` (Schriften, `@theme`), `src/pages/Home.tsx` (Kacheln und Register). |
| Vorschlagsseite: https://claude.ai/code/artifact/764bc923-36f6-4751-8e8e-01eddec5c826 | Abschnitte „Kategorien“ mit „Data-Hub-Kacheln“, „Kacheln und Einträge“ (Register), „Deckende Farbe“ (Kommunalwahl in Nachtblau), „Navigation für die Familie“ (Variante A zeigt den Data Hub). |
| `PLATTFORM.md` | Drei Fallen (Router-`basename`, SPA-Fallback, Diagrammbreite), die öffentliche Auswahl, der Grund für den Pergamentgrund. |
| `src/lib/cardKind.ts` | Warum die drei Herkunftsarten je einen eigenen Grundton tragen. |
| `OFFENE-PUNKTE.md` | pnpm, Hausbasis, TypeScript 7, zwei Builds. |

## 2. Die Entscheidungen, übersetzt in den Data Hub

| Entscheidung (14.09.2026) | Heute im Data Hub | AP |
|---|---|---|
| Schriften Source Serif 4, Atkinson Hyperlegible Next, Madelon Script | Inter und Playfair über Fontsource; acht Diagramme tragen „Inter Variable“ fest ein | 1 |
| Zahlen, gefundene Fehler | `fmtInt` schreibt „1,656“ mit englischem Tausendertrenner | 2 |
| Kaum Versalien, Etiketten nur wo sie informieren | `.eyebrow` in Versalien an gut einem Dutzend Stellen | 3 |
| Kategorien Variante C; Data-Hub-Kacheln; Register schmal | `DatasetCard`, `KartenCard` mit Kicker und Anzahl in einer Zeile | 4 |
| Überlappung Variante 1; Seitenköpfe | Startseite ohne Handschrift und Zeichnung | 5 |
| Farbflächen, Themenfarben | keine | 6 |
| Navigation Variante A | Logo, zwei Links, Stripe unter dem Kopf; Fuß „der Stadt Moosburg“ | 7 |
| Ecken 4 und 10 px | `rounded-lg` 6 px, Plot-Radien 8 und 12 | 8 |
| Status: Rose | **nicht anwendbar**, die App kennt keine Projektzustände | keins |

**Nicht Teil der Probe:** Dunkelmodus; Farben und Formen der Diagramme (Daten-Palette,
Likert-Rampe); Filterlogik; ETL-Skripte und JSON unter `public/data/`; die Zähler-Einbindung
(offen laut `PLATTFORM.md`, eigener Commit, nicht mit der Probe mischen); die Karten-Apps
(Abschnitt 6); die Abweichungen von der Hausbasis.

## 3. Rahmen, der nicht verhandelbar ist

**Ablauf: lokal prüfen, nach Freigabe direkt mergen** (Benedict, 14.09.2026). Gearbeitet
wird auf `probe/formsprache`. Nach Benedicts Freigabe wird der Branch in `main` gemergt und
gepusht; damit ist die Probe live, denn `main` deployt über `pages.yml` nach GitHub Pages
und über `moosburg-eu.yml` nach `/data/`. Alle Projekte teilen ein FTP-Konto, deshalb den
Lauf abwarten, bevor ein anderes Repo pusht. Kleine Commits je Arbeitspaket, deutsche
Commit-Nachrichten, **ohne jeden Hinweis auf KI-Unterstützung**.

**Keine öffentliche Vorschau.** Eine Vorschau unter `/v2/` gibt es nur beim Haushalt
(Benedict, 14.09.2026). Hier wird lokal geprüft: beim Bauen mit `pnpm dev`, für die
Screenshots mit den gebauten Fassungen unter beiden Basispfaden, `pnpm build` plus
`pnpm preview` (`/datahub/`) und `pnpm build:hostinger` plus `pnpm preview --base /data/`.
Bleibt eine davon weiß, zuerst Falle 1 in `PLATTFORM.md` prüfen.

**Kanon nicht anfassen.** Abweichungen stehen in `src/index.css` im `@theme`-Block nach dem
Import des Kanons, jede mit dem Kommentar `/* Probe Formsprache, vorläufig (14.09.2026): … */`.
Der Block führt heute schon dokumentierte Abweichungen (Display-Skala, Daten-Palette); die
bleiben.

**Pakete und Hausbasis.**

- Neu hinzu kommen genau drei Pakete, in denselben Ranges wie in der Haushalt-Probe, damit
  der pnpm-Store je eine Kopie hält:
  - `@fontsource-variable/source-serif-4` `^5.3.0`
  - `@fontsource-variable/atkinson-hyperlegible-next` `^5.3.0`
  - `@phosphor-icons/react` `^2.1.10`
- `@fontsource-variable/inter` und `@fontsource/playfair-display` bleiben in der
  `package.json`, bis die Entscheidung endgültig ist; nur ihre Imports fliegen raus.
- **Nichts sonst hochziehen.** Der Data Hub weicht bereits von `../hausbasis/baseline.json`
  ab (etwa `react ^19.0.0`, `tailwindcss ^4.0.0`). Das ist ein eigenes Thema.
- pnpm, nicht npm. Es gibt zwei Builds: `pnpm build` **und** `pnpm build:hostinger` müssen
  grün sein. Eine Testsuite gibt es nicht; geprüft wird über `pnpm typecheck`, beide Builds,
  Screenshots und gezielte Stichproben.

**Öffentliche Auswahl.** Auf moosburg.eu kürzt der Workflow das Manifest auf vier Datensätze
(`PLATTFORM.md`). Lokal und auf Pages sind alle sechs da. Alles, was aus dem Manifest
auswählt (etwa der Aufmacher in AP 6), muss mit dem gekürzten Manifest funktionieren und
darf keine ID fest eintragen.

**Rot im Data Hub.** Rot ist die Hausfarbe der Umfragen, und die Likert-Rampe beginnt mit Rot
für negative Antworten. Aktive Zustände nach der Vorschlagsseite in `red-700` bauen und
gegen Tinte als Paar zeigen.

**Textstimme.** Neuer sichtbarer Text ohne Gedankenstriche; Zahlenbereiche behalten den
Halbgeviertstrich. Bestehende Texte nicht flächendeckend umschreiben. Neue Texte vorher
zeigen.

**Barrierefreiheit halten.** `ChartTable` als Tabellen-Zwilling, `sr-only`, Fokus auf
interaktiven SVG-Formen (`index.css:116-126`), `aria-label` der Filterbalken, die
`HelpIcon`-Erklärungen, die große Grundschrift (17 px mobil, 18 px Desktop).

---

## 4. Arbeitspakete

Zeilennummern vom Stand `d4ec024`.

### AP 0: Vorbereitung und Vorher-Stand

1. `git status`, dann `git switch -c probe/formsprache` von `main`.
2. `pnpm install`, `pnpm typecheck`, `pnpm build`, `pnpm build:hostinger`. Alle grün, sonst
   erst klären.
3. **Vorher-Screenshots** in 1440 und 390 px:
   - `/`
   - `/d/bahnhofumfrage_2023`: Kopf, Filterleiste, ein Kapitel, Pressestimmen
   - `/d/statistik_kommunal_2022`
   - `/d/kommunalwahl_2026` mit Hexmap und Gremium
   - `/d/volksfest_2024`
   - `/about`

   Ablage `docs/formsprache-probe/vorher/`, per `.git/info/exclude` ausgenommen. Für 390 px
   Playwright mit `viewport`.

**Prüfung:** vier grüne Befehle, Screenshots vorhanden.

### AP 1: Schriften

**Umsetzung wie Haushalt, AP 1**, mit `../haushaltvis/src/index.css` als Vorlage:

- Imports `@fontsource-variable/source-serif-4/opsz.css` und
  `@fontsource-variable/atkinson-hyperlegible-next`
- `--font-display`, `--font-sans` und `--font-script` im `@theme`-Block überschreiben
- Madelon Script als Datei nach `src/assets/fonts/` kopieren und per `@font-face` einbinden
- `font-feature-settings: "ss01", "cv11"` am `body` (`index.css:48`) entfernen, beides sind
  Inter-Features
- `h1, h2, h3, .headline` mit `font-optical-sizing: auto` und `lining-nums`

**Diagramme.** Observable Plot bekommt die Schrift als Inline-Style. Diese acht Diagramme
tragen `fontFamily: "Inter Variable, Inter, sans-serif"` fest ein:

- `BarH`, `BarV`, `LineSeries`, `Diverging3`
- `DivergingLikert`, `Correlation`, `StackedColumn`, `Pyramid`

Umstellen auf `"var(--font-sans)"`, wie es `Radar.tsx` und `svg/Chip.tsx` schon tun; die
Variable wirkt, weil Plot sie in das `style`-Attribut des SVG schreibt. Anders als ECharts
im Haushalt zeichnet Plot kein Canvas, es muss also nicht auf die Schriften gewartet werden.
Die Mittelzahl im `Pie` (`Pie.tsx:128`) bekommt `lining-nums tabular-nums`.

**Achtung, breitere Schrift.** Atkinson läuft breiter als Inter. Im Haushalt schnitt das
lange Namen im Flussdiagramm ab. Hier prüfen: Beschriftungen in `BarH`, `DivergingLikert`,
`Pyramid`, die Fragetexte der Filterleiste, die Mindestbreite von `BarV` (Falle 3 in
`PLATTFORM.md`).

**Prüfung:** gerenderte Schriften, auch im SVG, nur die drei neuen;
`grep -rn "Inter Variable" src` leer.

### AP 2: Zahlen und Fehler

1. **Englischer Tausendertrenner.** `src/lib/format.ts:3` setzt `fmtInt = format(",d")` aus
   d3-format, das ergibt „1,656 Antworten“ neben „2.868.813“. Umstellen auf
   `new Intl.NumberFormat("de-DE")`, wie `fmtPct` direkt darunter. Danach alle übrigen
   `format(`-Aufrufe aus d3-format in `src/` suchen (Achsen, Tooltips) und gleich behandeln.
   In den erzeugten Texten unter `public/data/` nach demselben Fehler suchen
   (`grep -nE "[0-9],[0-9]{3}" public/data/*.json`). Treffer dort nur melden, nicht von Hand
   ändern: Die Texte erzeugen `scripts/stats-insights.mjs` und `apply-section-texts.mjs`.
2. **Kennzahlen.** `Stat` (`src/components/Stat.tsx`) folgt dem Muster `Kennzahl` aus dem
   Haushalt: Zahl zuerst in der Titelschrift mit `lining-nums tabular-nums`, Beschriftung
   darunter in Satzschreibung. „Quelle“ ist Text und bleibt in der Textschrift.
3. **Zeichen statt Icons.** „←“ im Rücklink und im Fehlerzustand von `Dataset.tsx` (60, 94)
   wird zu Phosphor `ArrowLeft`, `aria-hidden`.

**Prüfung:** „1.656 Antworten“ auf der Startseite und auf der Datensatzseite; nirgends mehr
Komma als Tausendertrenner.

### AP 3: Versalien und Etiketten

**Ist:** `.eyebrow` (`index.css:78`) setzt Versalien mit 0,14 em Sperrung. `.headline` ist
schon in Satzschreibung. Fundstellen und Vorschlag:

| Stelle | Heute | Vorschlag |
|---|---|---|
| `Home.tsx:17` | „Data Hub“ über der H1 | streichen, doppelt zum Kopf (im Haushalt ebenso) |
| `Home.tsx:28`, `:58` | „Datensätze“, „Karten“ als h2 im Etikett-Stil | echte h2 in der Titelschrift |
| `Header.tsx:18` | „Moosburg an der Isar“ unter dem Namen | entfällt mit AP 7 |
| `Dataset.tsx:93` | Rücklink „← Data Hub“ | Satzschreibung mit Icon (AP 2) |
| `Section.tsx:14` | „Kapitel {n}“ über jedem Kapitel | **Frage:** Die Nummer ist keine Kategorie und steht über jedem Abschnitt. Streichen oder als ruhige Zeile in Satzschreibung? |
| `Stat.tsx:6` | Label über der Zahl | Beschriftung unter der Zahl (AP 2) |
| `FilterChart.tsx:72` | Fragetext der Filter in Versalien | Satzschreibung, 13 px, 600; zweizeilig erlaubt |
| `PressSection.tsx:8` | „Pressestimmen“ | h2 wie die Kapitel |
| `PressCard.tsx:56` | Metazeile in Versalien | Satzschreibung |
| `Venn3.tsx:299` | „Schnittmengen“ | Satzschreibung |
| `About.tsx:4` | „Über“ über der H1 | streichen |
| `cardKind.ts` | Kicker der Kacheln | Kategoriezeile, AP 4 |

Danach `.eyebrow` aus `index.css` löschen.

**Prüfung:** `grep -rn "eyebrow\|uppercase" src` ohne unkommentierte Treffer.

### AP 4: Kacheln und Register

**Spezifikation** (Protokoll, Zeilen „Data-Hub-Kacheln“ und „Kacheln und Einträge“;
Vorschlagsseite, „Data-Hub-Kacheln“):

- oben Klecks (46 px) plus Kategoriezeile
- Titel in der Titelschrift
- unten, abgesetzt durch eine Haarlinie, die Anzahl als eigene Zeile: Zahl groß in der
  Titelschrift (`lining-nums tabular-nums`), Einheit daneben in der Textschrift

**Kategorie je Herkunftsart**, eine Quelle in `src/lib/cardKind.ts` (um `icon` und `farbe`
ergänzen):

| Art | Kategoriezeile | Icon | Farben (Text / Klecks) | Grund |
|---|---|---|---|---|
| Umfrage | „Umfrage {Jahr}“ | `ClipboardText` | `red-700` / `red-100` | weiß, bleibt |
| Amtliche Statistik | „Amtliche Statistik“ | `Stamp` | `gold-700` / `gold-200` | Pergament `gold-100`, Rahmen `gold-200`, bleibt |
| Eigene Auswertung | „Eigene Auswertung“ | `MapTrifold` | `#6b3e7a` / `#e2d2e8` | Schraffur `.card-hatch`, bleibt |

Die Schraffur kommt auf der Vorschlagsseite nicht vor. Sie bleibt, weil `cardKind.ts`
begründet, warum sie auch in Graustufen trägt; im Ergebnis zeigen. Kontrast nachrechnen:
Kategoriezeile auf Pergament (`gold-700` auf `gold-100`, laut `PLATTFORM.md` 5,6:1) und
Purpur auf der Schraffur.

**Anzahl-Zeile.**

- `DatasetCard`: `n` mit Einheit „Antworten“, „Datenpunkte“ oder „Werte“, wie heute.
- `KartenCard` (`Home.tsx:60-74`) trägt heute ganze Sätze mit festen Zahlen. Aufteilen in
  Zahl und Einheit: „2.868.813 Einzelbäume“, „8 Kartenausgaben“, „1.714 Gerichte“. Was
  wegfällt („von 1960 bis heute, übereinandergelegt“, „aus 17 Speisekarten, jede mit Quelle
  und Datum“), mit vorlegen. Dass diese Zahlen fest im Code stehen und aus anderen Repos
  kommen, ist bekannte Drift und nicht Teil der Probe.

**Hover.** Heute `shadow-soft` mit Anheben. Die Spezifikation nennt nur weiß, 1 px Linie,
10 px Radius. Das Verhalten der Kacheln aus der Haushalt-Probe übernehmen
(`../haushaltvis/src/pages/Home.tsx`), damit die Familie gleich reagiert, und die Abweichung
vom heutigen Stand vermerken.

**Unter 640 px: Register.** Einträge ohne Rahmen, Haarlinien, Klecks (38 px) links, Titel
und Anzahl als Unterzeile, Pfeil rechts, wie die Einstiege auf der Haushalt-Startseite.
Pergament und Schraffur entfallen dort; die Kategoriezeile trägt die Art.

**Prüfung:** 1440 px: Kacheln gleich hoch, Anzahl-Zeilen auf einer Linie. 390 px: Register
ohne Rahmen. Kontrastwerte im Ergebnis.

### AP 5: Seitenköpfe und Überlappung

**Startseite** (`Home.tsx:16-25`):

- H1 „Was Moosburg sagt, sichtbar gemacht.“ mit Überlappung Variante 1 über `SeitenTitel`
  aus dem Haushalt, mit den Werten nach Benedicts Rückmeldung: `top: -0.42em`, etwa 0,85 em
  Abstand darüber, `gold-500` etwa 55 %, 1,45 ×, −6°.
- Script-Wort als Vorschlag: „nachgefragt“ (Umfragen sind der Kern). Benedict entscheidet.
- Der Lead enthält einen Gedankenstrich und „aus der Stadt“. Wird er ohnehin angefasst,
  Vorschlag: „Bürgerbefragungen, offene Daten und Auswertungen aus Moosburg, kompakt und
  ohne Anmeldung.“ Vorlegen.
- Ab 640 px `SeitenKopf` mit Federzeichnung als Maske in Gold, rechts unten angeschnitten.
  Vorschlag `buechereiA.svg` aus `../moosburg/public/sketches/`: die Bücherei als Ort des
  Nachschlagens. Das Portal trägt das Münster, der Haushalt Rathaus B, für den Stadtrat ist
  Rathaus C vorgeschlagen.
- Beschnitt nur an der Zeichnung, nie am Titel (Haushalt-Lehre).

**Logo-Platz.** `public/logo.svg` ist die Rose (Illustrator-Export in `#7f0000`), kein
eigenes Tool-Logo. Sie steht als Platzhalter im Logo-Platz, in `red-700` wie die
`Rose`-Komponente des Haushalts. Die Doppelung mit der Rose von „moosburg.eu“ ist bis zu den
Tool-Logos in Ordnung (Benedict, 14.09.2026).

**Datensatzseiten** bleiben kompakt, ohne Überlappung: Rücklink, darüber die Kategoriezeile
mit Klecks der Herkunftsart, H1, Beschreibung, Kennzahlen (AP 2).

**Über-Seite:** kompakter Kopf ohne Etikett.

**Prüfung:** 200 % Zoom und 390 px: Titel lesbar, Script nicht abgeschnitten.

### AP 6: Farbfläche als Aufmacher

Die Vorschlagsseite nennt den Aufmacher für einen neuen Datensatz als Ort. Auf der
Startseite über dem Raster „Datensätze“:

- Kategoriezeile der Herkunftsart, Titel des Datensatzes, große Zahl mit Einheit in
  `gold-200`, Knopf in Creme „Ansehen“ nach `/d/:id`
- alle Werte aus dem Manifest, nichts fest eintragen
- Themenfarbe nach Inhalt, an einer Stelle zugeordnet: Wahl Nachtblau (so auf der
  Vorschlagsseite), Umfrage Tiefrot, amtliche Statistik Gold-700
- Stripe als unterer Abschluss, volle Breite; höchstens eine Fläche pro Bildschirm

**Welcher Datensatz?** Offen, Benedict entscheidet. **Vorschlag:** der erste Eintrag des
Manifests. Die Reihenfolge dort ist ohnehin kuratiert, es braucht kein neues Feld, und auf
moosburg.eu kann nie ein zurückgehaltener Datensatz erscheinen, weil der Workflow das
Manifest vorher kürzt.

Werte und Kontrast: Protokoll, Abschnitt 4 und 6.

**Farb-Experiment** (Wunsch Benedict, 14.09.2026). Im Data Hub dürfen Flächen andere
Themenfarben als Rot tragen; die Vorschlagsseite zeigt die Kommunalwahl schon in Nachtblau.
Über den Aufmacher hinaus als Screenshot-Reihe ausprobieren:

- **Kopf der Datensatzseite als deckende Fläche** in der Themenfarbe des Datensatzes,
  gegen den hellen Kopf aus AP 5. Vorschlag: Kommunalwahl Nachtblau, Bahnhofumfrage
  Isar-Petrol, Volksfest Tiefrot, Statistik kommunal Tannengrün oder Gold-700.
- Die Zuordnung steht in einer Konstante nach Datensatz-ID, mit Tiefrot als Rückfall. Keine
  neuen Felder im Manifest oder in den JSON-Dateien.
- Die klebende Filterleiste bleibt hell; höchstens eine Fläche pro Bildschirm.
- Diagrammfarben bleiben unberührt. Prüfen, dass die Fläche nicht mit Datenfarben im selben
  Bild konkurriert, etwa Nachtblau neben den Parteifarben der Kommunalwahl.

Nichts festlegen; Benedict wählt aus der Reihe.

### AP 7: Navigation, Über das Projekt, Fuß

**Ist:** `Header.tsx`, klebt oben mit `backdrop-blur`: Logo, „Data Hub“, darunter
„Moosburg an der Isar“; Links „Übersicht“ und „Über“, aktiv in `red-700`; Stripe unter dem
Kopf. Die Filterleiste der Datensatzseite klebt mit `top-[57px]` an dieser Höhe
(`Dataset.tsx:136`).

**Soll am Desktop, Variante A** (Vorschlagsseite, Abschnitt Navigation; dort ist genau der
Data Hub gezeigt):

```
[Stripe 4 px an der Oberkante]
[Rose] moosburg.eu │ [Logo] Data Hub   Übersicht  Karten  Über die Daten │ (i) Über das Projekt ▾
```

- `Header.tsx` aus der Haushalt-Probe als Vorlage: Zeile 64 px, Disclosure mit Esc, Klick
  außerhalb und Fokus zurück, kein `role="menu"`.
- „moosburg.eu“ verlinkt auf `https://moosburg.eu/`, in beiden Fassungen.
- „Karten“ springt auf den Abschnitt der Startseite; „Über die Daten“ ist die heutige Seite
  `/about`.
- Ab welcher Breite die Zeile passt, am gebauten Stand messen und im Ergebnis vermerken.
  Im Haushalt waren es 1024 px bei vier Einträgen plus Suche.
- **Kein `backdrop-blur`**: Im Haushalt wurde der Kopf dadurch zum Bezugsrahmen des mobilen
  Blatts.
- Die Kopfhöhe als CSS-Variable (`--kopf-hoehe` wie im Haushalt); die Filterleiste klebt an
  `top-[var(--kopf-hoehe)]` statt an 57 px.

**Mobil:** App-Leiste mit „Data Hub“ links (verlinkt die Übersicht), rechts ein Rosen-Knopf,
der ein Blatt öffnet: moosburg.eu, Karten, Über die Daten, Über das Projekt. **Keine
Tab-Leiste**, weil es nur eine Hauptansicht gibt. Als Frage vorlegen.

**Inhalt von „Über das Projekt“, als Vorschlag vorlegen:**

- Titel „Data Hub Moosburg“
- „Umfragen, amtliche Statistik und Karten aus Moosburg, interaktiv aufbereitet.“
- „Privates Projekt, kein Auftritt der Stadt. Verbindlich sind die jeweiligen Quellen.“
- Links: Über die Daten, Impressum und Kontakt (der Data Hub hat kein eigenes Impressum;
  Vorschlag: Verweis auf das Impressum von moosburg.eu), Fehler melden (GitHub-Issues laut
  README), Quellcode

**Fuß** (`Footer.tsx`): nennt sich „Data Hub der Stadt Moosburg an der Isar“ und verlinkt
`moosburg.org`. Das Protokoll führt das als offen, inhaltlich mit Benedict zu klären. Nichts
selbst umformulieren; einen Vorschlag vorlegen und fragen, was `moosburg.org` ist.

**Über-Seite** (`About.tsx`): verspricht, man könne „jeden Datensatz herunterladen oder im
Methodik-Hinweis nachlesen“. Beides gibt es in der App nicht (Suche am 14.09.2026 in
`src/`), dazu „offene Daten der Stadt Moosburg“. Korrekturvorschlag vorlegen, Benedict
entscheidet.

**Prüfung:** Tastatur durch Kopf und Disclosure; 390 px: Filterleiste klebt ohne Lücke unter
der App-Leiste; Blatt über allem.

### AP 8: Ecken und Kleinkram

- Im `@theme`-Block `--radius-lg: 10px` wie im Haushalt (Kanon 6 px). `rounded-xl` ist im
  Kanon schon 10 px. `rounded-md` (4 px) bleibt für Kleinteile.
- `src/lib/palette.ts:47-48` spiegelt die Radien für SVG (`card: 8`, `hero: 12`): beide auf
  10.
- Segmente, falls ein Diagramm Ansichten umschaltet (Hexmap zeigt drei Ansichten): Aussehen
  wie auf der Vorschlagsseite, Tastatursteuerung unverändert.
- Einseitige Kanten: `PLATTFORM.md` hat den Balken der Übersichtskarten schon ersetzt. Nur
  gegenprüfen, `grep -rn "border-l-\|border-t-[2-9]" src`.

### AP 9: Nachher-Stand, Auswertung, Protokoll

1. Nachher-Screenshots wie in AP 0 nach `docs/formsprache-probe/nachher/`, Paare nach
   `nachher/paare/`.
2. `docs/formsprache-probe/ERGEBNIS.md` nach dem Muster des Haushalts, mit Kontrastwerten aus
   AP 4 und AP 6.
3. Protokoll `../moosburg-design/docs/formsprache/ENTSCHEIDUNGEN.md`, Abschnitt „Verlauf“:
   Datum, Branch, Commits, Verweis aufs Ergebnis. Entscheidungen nicht auf endgültig setzen.

**Abschlussprüfung, alle grün:**

- [ ] `pnpm typecheck`, `pnpm build`, `pnpm build:hostinger`
- [ ] `grep -rn "eyebrow\|uppercase\|Inter Variable" src` ohne unkommentierte Treffer
- [ ] gerenderte Schriften, auch in den Diagrammen, nur die drei neuen
- [ ] kein Komma als Tausendertrenner in der Oberfläche
- [ ] lokale Vorschau unter `/datahub/` und `/data/` lädt (nicht weiß), Datensatz-Routen funktionieren
- [ ] 390 px: kein waagrechter Scroll, Filterleiste klebt richtig, Register ohne Rahmen
- [ ] Tastatur: Kopf, Disclosure, Filterbalken, Hilfe-Popover
- [ ] `ChartTable`-Zwillinge vorhanden
- [ ] 200 % Zoom: Titel mit Überlappung lesbar
- [ ] Vorher/Nachher vollständig, `ERGEBNIS.md` geschrieben, Protokoll nachgeführt

---

## 5. Offene Fragen, die Benedict vorgelegt werden

| Frage | Wie vorlegen |
|---|---|
| Aktive Zustände in Rot oder Tinte? | Paar Kopf |
| „Kapitel {n}“ streichen oder ruhig behalten? | Paar Datensatzseite |
| Karten-Kacheln: was aus den Sätzen wird | Textvorschlag |
| Schraffur für eigene Auswertungen behalten? | Screenshot Startseite |
| Script-Wort „nachgefragt“, neuer Lead | Screenshot Startseite |
| Federzeichnung `buechereiA`? | Screenshot 1440 px |
| Aufmacher: erster Eintrag des Manifests? | Screenshot Startseite |
| Mobil ohne Tab-Leiste, Links im Blatt | Screenshot 390 px |
| Texte für „Über das Projekt“, Fuß, Über-Seite; was ist `moosburg.org`? | Textvorschlag |
| Farb-Experiment: Datensatz-Köpfe als Fläche, welche Themenfarbe je Datensatz? | Screenshot-Reihe Datensatzseiten |

## 6. Die Elemente unter /data/: Folgeschritte, nicht Teil dieser Probe

Unter `/data/` hängen eigenständige Anwendungen aus eigenen Repos. Die Startseite des Data
Hub verlinkt drei davon. Für sie gilt dasselbe wie hier (Familien-Navigation, Schriften,
Versalien, Ecken). Ihre Kartenpanels sind dicht wie ein Werkzeug; ob sie Seitentitel mit
Überlappung bekommen, klärt der erste Blick. Jede bekommt ein eigenes Briefing, sobald
Benedict das Ergebnis dieser Probe gesehen hat.

| Anwendung | Repo, Adresse | Stand am 14.09.2026 | Worauf achten |
|---|---|---|---|
| Baumkarte | `baumkarte`, `/data/baumkarte/` | Vite, Playfair und Inter; 8 Treffer für `eyebrow` oder `uppercase` in `src/` | täglicher Umwelt-Cron committet auf `main`, vor jedem Push pullen; Kachelsätze 52 MB; soll für Nachnutzung abstrahiert werden. Themenfarben der Vorschlagsseite: Tannengrün, Isar-Petrol fürs Bodenwasser. |
| Moosburg historisch | `moosburg-historisch`, `/data/historisch/` | Vite, Playfair und Inter; 5 Treffer | Kachelsätze 100 MB. Themenfarbe der Vorschlagsseite: Erdbraun. |
| Speisekarten | `foodhub`, `/data/foodhub/` | Vite, Playfair und Inter; 13 Treffer | fehlt in der Familientabelle von `../moosburg-eu/BRIEFING.md`. Themenfarbe offen. |
| Wahlen | `elections`, `/data/wahlen/` | eigenes Idiom, bewusst ohne Moosburg-Design | abstrakter Kern (Entscheidung 3 in `../moosburg-eu/UMBAU.md`). Nur eine künftige Moosburger Ausspielung trägt die Formsprache. Nicht anfassen. |
