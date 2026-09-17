# Briefing: Formsprache-Probe im Data Hub

*Neu geschrieben am 17.09.2026, nachdem drei Lesungen mit Benedict die offenen Punkte
geklärt haben. Status: **Probe, nicht freigegeben.** Alles hier setzt vorläufige
Entscheidungen um; Kanon ist allein `../moosburg-design/css/theme.css`.*

Die erste Fassung dieses Briefings stammt vom 14.09.2026 und kannte weder die Lehren aus der
Stadtrat-Probe noch die Entscheidungen der drei Lesungen. Diese Fassung ersetzt sie
vollständig. Wer neu dazukommt: Abschnitte 1 bis 3 ganz lesen, dann die Arbeitspakete der
Reihe nach.

---

## 1. Stand und Umfang

Der Haushalt hat die Formsprache zuerst erprobt, dann das Portal, dann der Stadtrat. Der
Stadtrat ist seit 16.09.2026 live; seine Lehren stehen in Abschnitt 2 und sind hier
eingearbeitet. Der Data Hub ist das vierte Projekt.

**Dabei sind vier Seiten:**

| Seite | Route | Besonderheit |
|---|---|---|
| Übersicht | `/` | Kacheln der Datensätze, Kacheln der Karten |
| Bahnhof 2023 | `/d/bahnhofumfrage_2023` | 1.656 Antworten, drei Filter, vier Kapitel, Pressestimmen, ein Kapitel mit offenen Themen |
| Volksfest 2024 | `/d/volksfest_2024` | 189 Antworten, zwei Filter, acht Kapitel, Pressestimmen |
| Bevölkerungsstatistik 2022 | `/d/statistik_kommunal_2022` | amtlich, keine Filter, fünf Kapitel |

**Nicht dabei:** die Wahlergebnisse (`/d/kommunalwahl_2026`) und die drei Karten-Apps unter
`/data/` (Baumkarte, Moosburg historisch, Speisekarten). Sie bekommen eigene Runden.

**Aber:** Die Wahlseite benutzt dieselben Bausteine wie die übrigen Datensatzseiten. Alles,
was in `Dataset.tsx`, `Header.tsx` oder `DatasetCard.tsx` geändert wird, erscheint dort
sofort mit. Das ist unvermeidlich. Nur ihre eigenen Elemente (Hexmap, Gremium) bleiben
unangetastet. Die Karten-Kacheln auf der Übersicht sind Teil dieser Probe, die Anwendungen
dahinter nicht.

Lokal liegen zwei weitere Umfragen im Manifest (Christkindlmarkt 2025, Website-Innovationen
2025), die der Workflow öffentlich zurückhält. Sie sind derselbe Seitentyp und erben alles.

### Quellen, in dieser Reihenfolge

| Quelle | Wozu |
|---|---|
| `../moosburg-design/docs/formsprache/ENTSCHEIDUNGEN.md` | Das Protokoll. **Maßgeblich**, falls Briefing und Protokoll auseinanderlaufen. Abschnitt 4 hat die Werte, Abschnitt 5 die verworfenen Varianten. |
| `../council/docs/formsprache-probe/ERGEBNIS.md` | Die Lehren aus der letzten Probe, besonders „Für die nächsten Proben“. |
| `../haushaltvis` Branch `probe/formsprache` | Vorlage zum Übernehmen: `src/components/ui.tsx` (`Klecks`, `KategorieZeile`, `Kennzahl`, `Rose`, `SeitenTitel`, `SeitenKopf`, `SketchGround`, `Stripe`), `src/components/Header.tsx`, `src/lib/kategorien.ts`, `src/index.css`. Gleicher Stack wie hier. |
| Die drei Lesungen | [Erste](https://claude.ai/artifact/7yJQBjHVUt2bakmAsVmTXY), [zweite](https://claude.ai/artifact/K7x9KzUVvjAkREAmkvehPR), [dritte](https://claude.ai/artifact/D8g4dAkGrFwFzDtMyqtHjT). Dort stehen die Attrappen zu allem, was unten beschrieben ist. |
| `PLATTFORM.md` | Drei Fallen (Router-`basename`, SPA-Fallback, Diagrammbreite), die öffentliche Auswahl, der Grund für den Pergamentgrund. |
| `src/lib/cardKind.ts` | Warum die drei Herkunftsarten je einen eigenen Grundton tragen. |

---

## 2. Was entschieden ist

Alles vorläufig, alles aus den drei Lesungen. Die verworfenen Varianten stehen im Protokoll,
Abschnitt 5, mit ihren Werten.

| Thema | Entscheidung | AP |
|---|---|---|
| Schriften | Source Serif 4, Atkinson Hyperlegible Next, Madelon Script. Inter und Playfair verlieren ihre Imports, auch in den acht Diagrammen. | 1 |
| Zahlen | `lining-nums tabular-nums`, Zahl zuerst, Beschriftung darunter. Deutscher Tausendertrenner. | 2 |
| Versalien | keine mehr, `.eyebrow` wird gelöscht | 3 |
| Kacheln | Klecks 46 px plus Kategoriezeile, Titel in der Titelschrift, Anzahl als eigene Zeile über einer Haarlinie | 4 |
| Herkunftsarten | alle drei Gründe bleiben: weiß (Umfrage), Pergament (amtlich), Schraffur (eigene Auswertung) | 4 |
| Karten-Kacheln | Restsatz bleibt, als ein Satz über der Zahl | 4 |
| Kopf der Übersicht | Handschrift „nachgefragt“, Federzeichnung `buechereiA` in Gold ab 1280 px, Etikett „Data Hub“ fällt weg | 5 |
| Aufmacher | keiner auf der Übersicht | — |
| Kopf der Datensatzseiten | Band über die volle Breite in der Themenfarbe, Kennzahlen darin als Zeile, kein Stripe | 6 |
| Themenfarben | Bahnhof Isar-Petrol `#123b4a`, Volksfest Tiefrot `#6d0818`, Statistik Gold-700 `#6e5a30` | 6 |
| Quelle | keine Kennzahl, sondern Teil der Kategoriezeile | 6 |
| Navigation | Variante A ab 1024 px, darunter App-Leiste mit Blatt. Der Weg zurück auf moosburg.eu steht rechts oben im Info-Panel. | 7 |
| Fuß | `moosburg.org` fällt ersatzlos weg, die Selbstbezeichnung wird korrigiert | 7 |
| Kapitelzeile | „Kapitel N“ gestrichen | 8 |
| Orientierung | nicht klebendes Inhaltsverzeichnis unter dem Kopf, dazu ein Stepper in der klebenden Leiste: Name in der Mitte, Pfeile links und rechts | 8 |
| Filter am Handy | zwei bis drei Knöpfe, immer sichtbar, je einer pro Kategorie, die eine Auswahlliste öffnen | 9 |
| Auswahlliste | Balken als Hintergrund der Zeile, „ohne Angabe“ als normale Zeile | 9 |
| Filterfarben | ruhig Gold-500 `#b8964e`, gewählt Gold-700 `#6e5a30`, dazu 2 px Grundstrich. Rot fällt hier weg. | 9 |
| Offene Themen | der Abschnitt `open_themes` der Bahnhofumfrage wird als Register gebaut | 10 |
| Ecken | 8 px für Kacheln, Flächen, Knöpfe; 4 px für Kleinteile; Pille nur für Chips | 11 |
| Zeichnungen | eine je Datensatz, Beginn mit dem Bahnhof | 12 |

### Was der Stadtrat mitgibt

- **Stripe nur einmal**, oben im Kopf. Farbflächen schließen ohne ihn ab.
- **Band über die ganze Breite:** `margin-inline: calc(50% - 50vw)` plus
  `padding-inline: calc(50vw - 50%)`, dazu `body { overflow-x: clip }`, weil `50vw` eine
  sichtbare Scrollleiste mitzählt.
- **Keine einseitige Farbkante** an Karten, auch nicht als Datenmarke.
- **Kategoriezeile statt Wiederholung.** Steht die Art in der Zeile, sagt der Titel sie nicht
  noch einmal.
- **Kein `backdrop-blur`** im Kopf: Im Haushalt wurde er dadurch zum Bezugsrahmen des mobilen
  Blatts.
- **Nicht zwei klebende Ebenen übereinander.** Stepper und Filterzeile teilen sich deshalb
  eine Leiste.
- **Ein `hidden` gebautes Gegenstück** hilft beim Vergleich, muss aber vor dem Merge raus.

---

## 3. Rahmen, der nicht verhandelbar ist

**Ablauf: lokal prüfen, nach Freigabe direkt mergen.** Gearbeitet wird auf
`probe/formsprache`. Nach Benedicts Freigabe wird der Branch in `main` gemergt und gepusht;
damit ist die Probe live, denn `main` deployt über `pages.yml` nach GitHub Pages und über
`moosburg-eu.yml` nach `/data/`. Alle Projekte teilen ein FTP-Konto, deshalb den Lauf
abwarten, bevor ein anderes Repo pusht. Kleine Commits je Arbeitspaket, deutsche
Commit-Nachrichten, **ohne jeden Hinweis auf KI-Unterstützung**.

**Keine öffentliche Vorschau.** Eine Vorschau unter `/v2/` gibt es nur beim Haushalt. Hier
wird lokal geprüft: `pnpm dev` beim Bauen, für die Screenshots die gebauten Fassungen unter
beiden Basispfaden (`pnpm build` plus `pnpm preview` für `/datahub/`, `pnpm build:hostinger`
plus `pnpm preview --base /data/`). Bleibt eine davon weiß, zuerst Falle 1 in `PLATTFORM.md`
prüfen.

**Kanon nicht anfassen.** Abweichungen stehen in `src/index.css` im `@theme`-Block nach dem
Import des Kanons, jede mit dem Kommentar
`/* Probe Formsprache, vorläufig (17.09.2026): … */`. Der Block führt heute schon
dokumentierte Abweichungen (Display-Skala, Daten-Palette); die bleiben.
`--color-gold-400: #b39f7a` fällt in AP 9 weg.

**Pakete und Hausbasis.** Neu kommen genau drei Pakete, in denselben Ranges wie in der
Haushalt-Probe, damit der pnpm-Store je eine Kopie hält:

- `@fontsource-variable/source-serif-4` `^5.3.0`
- `@fontsource-variable/atkinson-hyperlegible-next` `^5.3.0`
- `@phosphor-icons/react` `^2.1.10`

`@fontsource-variable/inter` und `@fontsource/playfair-display` bleiben in der
`package.json`, bis die Entscheidung endgültig ist; nur ihre Imports fliegen raus. **Nichts
sonst hochziehen**, der Data Hub weicht ohnehin von `../hausbasis/baseline.json` ab. pnpm,
nicht npm. Es gibt zwei Builds, **beide** müssen grün sein. Eine Testsuite gibt es nicht;
geprüft wird über `pnpm typecheck`, beide Builds, Screenshots und Stichproben.

**Öffentliche Auswahl.** Auf moosburg.eu kürzt der Workflow das Manifest auf vier Datensätze
und löscht die übrigen JSON-Dateien aus `dist/`. Alles, was aus dem Manifest auswählt, muss
mit dem gekürzten Manifest funktionieren und darf keine ID fest eintragen.

**Barrierefreiheit halten.** `ChartTable` als Tabellen-Zwilling, `sr-only`, Fokus auf
interaktiven SVG-Formen (`index.css:116-126`), `aria-label` der Filterbalken, die
`HelpIcon`-Erklärungen, die große Grundschrift (17 px mobil, 18 px Desktop). Die neuen
Bedienelemente (Stepper, Filterknöpfe, Auswahlliste) sind mit der Tastatur zu bedienen und
kündigen ihren Zustand an.

**Textstimme.** Neuer sichtbarer Text ohne Gedankenstriche; Zahlenbereiche behalten den
Halbgeviertstrich. Bestehende Texte nicht flächendeckend umschreiben. Neue Texte vorher
zeigen.

---

## 4. Arbeitspakete

Zeilennummern vom Stand `d4ec024`, an dem sich seither nichts geändert hat.

### AP 0: Vorbereitung und Vorher-Stand

1. `git status`, dann `git switch -c probe/formsprache` von `main`.
2. `pnpm install`, `pnpm typecheck`, `pnpm build`, `pnpm build:hostinger`. Alle grün.
3. **Vorher-Screenshots** in 1440 und 390 px von `/`, den drei Datensatzseiten (Kopf,
   Filterleiste, ein Kapitel, Pressestimmen) und `/about`. Ablage
   `docs/formsprache-probe/vorher/`, per `.git/info/exclude` ausgenommen.

**Prüfung:** vier grüne Befehle, Screenshots vorhanden.

### AP 1: Schriften

Umsetzung wie Haushalt AP 1, mit `../haushaltvis/src/index.css` als Vorlage:

- Imports `@fontsource-variable/source-serif-4/opsz.css` und
  `@fontsource-variable/atkinson-hyperlegible-next`
- `--font-display`, `--font-sans`, `--font-script` im `@theme`-Block überschreiben
- Madelon Script nach `src/assets/fonts/` kopieren und per `@font-face` einbinden
- `font-feature-settings: "ss01", "cv11"` am `body` (`index.css:48`) entfernen, beides sind
  Inter-Features
- `h1, h2, h3, .headline` mit `font-optical-sizing: auto` und `lining-nums`

**Diagramme.** Diese acht tragen `fontFamily: "Inter Variable, Inter, sans-serif"` fest ein:
`BarH`, `BarV`, `LineSeries`, `Diverging3`, `DivergingLikert`, `Correlation`,
`StackedColumn`, `Pyramid`. Umstellen auf `"var(--font-sans)"`, wie es `Radar.tsx` und
`svg/Chip.tsx` schon tun. Die Mittelzahl im `Pie` (`Pie.tsx:128`) bekommt
`lining-nums tabular-nums`.

**Achtung, breitere Schrift.** Atkinson läuft breiter als Inter. Prüfen: Beschriftungen in
`BarH`, `DivergingLikert`, `Pyramid`, die Fragetexte der Filter, die Mindestbreite von `BarV`
(Falle 3 in `PLATTFORM.md`).

**Prüfung:** gerenderte Schriften auch im SVG nur die drei neuen;
`grep -rn "Inter Variable" src` leer.

### AP 2: Zahlen und Fehler

1. **Tausendertrenner.** `src/lib/format.ts:3` nutzt `format(",d")` aus d3-format, das ergibt
   „1,656 Antworten“ neben „2.868.813“. Auf `new Intl.NumberFormat("de-DE")` umstellen, wie
   `fmtPct` darunter. Danach alle übrigen `format(`-Aufrufe in `src/` gleich behandeln. In
   `public/data/*.json` nach demselben Fehler suchen
   (`grep -nE "[0-9],[0-9]{3}" public/data/*.json`), Treffer dort **melden, nicht ändern**:
   Die Texte erzeugen `scripts/stats-insights.mjs` und `apply-section-texts.mjs`.
2. **Kennzahlen.** `Stat` (`src/components/Stat.tsx`) folgt dem Muster `Kennzahl` aus dem
   Haushalt: Zahl zuerst in der Titelschrift mit `lining-nums tabular-nums`, Beschriftung
   darunter in Satzschreibung.
3. **Zeichen statt Icons.** „←“ im Rücklink und im Fehlerzustand von `Dataset.tsx` (60, 94)
   wird Phosphor `ArrowLeft`, `aria-hidden`.

**Prüfung:** „1.656 Antworten“ auf Übersicht und Datensatzseite; nirgends mehr ein Komma als
Tausendertrenner.

### AP 3: Versalien und Etiketten

`.eyebrow` (`index.css:78`) setzt Versalien mit 0,14 em Sperrung. Fundstellen:

| Stelle | Heute | Wird |
|---|---|---|
| `Home.tsx:17` | „Data Hub“ über der H1 | gestrichen, doppelt zum Kopf |
| `Home.tsx:28`, `:58` | „Datensätze“, „Karten“ im Etikett-Stil | echte h2 in der Titelschrift |
| `Header.tsx:18` | „Moosburg an der Isar“ | entfällt mit AP 7 |
| `Dataset.tsx:93` | Rücklink „← Data Hub“ | Satzschreibung mit Icon (AP 2) |
| `Section.tsx:14` | „Kapitel {n}“ | gestrichen (AP 8) |
| `Stat.tsx:6` | Label über der Zahl | Beschriftung unter der Zahl (AP 2) |
| `FilterChart.tsx:72` | Fragetext in Versalien | Satzschreibung, 13 px, 600 |
| `PressSection.tsx:8` | „Pressestimmen“ | h2 wie die Kapitel |
| `PressCard.tsx:56` | Metazeile in Versalien | Satzschreibung |
| `Venn3.tsx:299` | „Schnittmengen“ | Satzschreibung |
| `About.tsx:4` | „Über“ über der H1 | gestrichen |
| `cardKind.ts` | Kicker der Kacheln | Kategoriezeile (AP 4) |

Danach `.eyebrow` aus `index.css` löschen.

**Prüfung:** `grep -rn "eyebrow\|uppercase" src` ohne unkommentierte Treffer.

### AP 4: Kacheln, Kategoriezeilen, Register

**Kachel** (`DatasetCard.tsx`): oben Klecks (46 px) plus Kategoriezeile, darunter der Titel
in der Titelschrift, unten über einer Haarlinie die Anzahl als eigene Zeile (Zahl groß in der
Titelschrift mit `lining-nums tabular-nums`, Einheit daneben in der Textschrift).

**Kategorie je Herkunftsart**, eine Quelle in `src/lib/cardKind.ts` (um `icon` und `farbe`
ergänzen):

| Art | Kategoriezeile | Icon | Text / Klecks | Grund |
|---|---|---|---|---|
| Umfrage | „Umfrage {Jahr}“ | `ClipboardText` | `red-700` / `red-100` | weiß |
| Amtliche Statistik | „Amtliche Statistik“ | `Bank` | `gold-700` / `gold-200` | Pergament `gold-100`, Rahmen `gold-200` |
| Eigene Auswertung | „Eigene Auswertung“ | `ChartLineUp` | `#6b3e7a` / `#e2d2e8` | Schraffur `.card-hatch` |

Klecks: SVG `viewBox 0 0 48 48`, Pfad
`M25 3.5c8.6.3 17.8 5.2 19.2 14.6 1.5 9.8-4 21.5-14.4 24.9C19.7 46.3 6.6 41.5 4.3 30.7 2 19.6 12.2 3 25 3.5z`,
Varianten durch Drehung 70° und 150° gespiegelt. Fläche helle Tönung, Icon dunkle Tönung.

**Karten-Kacheln** (`Home.tsx:60-74`): Titel, ein Satz, dann die Zahl als eigene Zeile.

| Kachel | Satz | Zahl |
|---|---|---|
| Baumkarte | „Alle Einzelbäume rund um Moosburg.“ | 2.868.813 Einzelbäume |
| Moosburg historisch | „Acht Kartenausgaben von 1960 bis heute, übereinandergelegt.“ | 8 Kartenausgaben |
| Speisekarten | „Aus 17 Speisekarten, jede mit Quelle und Datum.“ | 1.714 Gerichte |

Dass diese Zahlen fest im Code stehen und aus anderen Repos kommen, ist bekannte Drift und
nicht Teil der Probe.

**Hover:** Verhalten der Kacheln aus der Haushalt-Probe übernehmen
(`../haushaltvis/src/pages/Home.tsx`), damit die Familie gleich reagiert.

**Unter 640 px: Register.** Einträge ohne Rahmen, Haarlinien, Klecks (38 px) links, Titel und
Anzahl als Unterzeile, Pfeil rechts. Pergament und Schraffur entfallen dort; die
Kategoriezeile trägt die Art.

**Prüfung:** 1440 px: Kacheln gleich hoch, Anzahl-Zeilen auf einer Linie. 390 px: Register
ohne Rahmen. Kontrastwerte ins Ergebnis (Gold-700 auf Gold-100 ist mit 5,6:1 vorgerechnet,
Purpur auf der Schraffur nachrechnen).

### AP 5: Kopf der Übersicht

`Home.tsx:16-25`:

- H1 „Was Moosburg sagt, sichtbar gemacht.“ mit Überlappung Variante 1 über `SeitenTitel` aus
  dem Haushalt: Script „nachgefragt“, `top: -0.42em`, etwa 0,85 em Abstand darüber,
  `gold-500` mit etwa 55 %, 1,45 ×, −6°, `aria-hidden`.
- Etikett „Data Hub“ streichen.
- Lead neu: „Bürgerbefragungen, offene Daten und Auswertungen aus Moosburg, kompakt und ohne
  Anmeldung.“
- Ab 1280 px `SeitenKopf` mit `buechereiA.svg` als Maske in Gold, rechts unten angeschnitten.
  Die Datei liegt in `../moosburg/public/sketches/` und wird nach `public/sketches/` kopiert.
  Beschnitten wird nur der Rahmen der Zeichnung, nie der Titel (Lehre aus Haushalt und
  Portal).
- **Logo-Platz:** `public/logo.svg` ist die Rose, in `red-700` wie im Haushalt. Die Doppelung
  mit der Rose von moosburg.eu ist bis zu den Tool-Logos in Ordnung.

**Prüfung:** 200 % Zoom und 390 px: Titel lesbar, Script nicht abgeschnitten, Zeichnung
kreuzt keine Buchstaben.

### AP 6: Kopfband der Datensatzseiten

`Dataset.tsx:92-132`. Das Band geht über die volle Breite (Technik siehe Abschnitt 2), der
Rest der Seite bleibt hell. Inhalt von oben nach unten: Rücklink, Kategoriezeile, Titel,
Beschreibung, Kennzahlen als Zeile. Kein Stripe als Abschluss.

**Themenfarbe** als Konstante nach Datensatz-ID, an einer Stelle, ohne neue Felder im
Manifest:

| Datensatz | Farbe |
|---|---|
| `bahnhofumfrage_2023` | Isar-Petrol `#123b4a` |
| `volksfest_2024` | Tiefrot `#6d0818` |
| `statistik_kommunal_2022` | Gold-700 `#6e5a30` |
| `kommunalwahl_2026` | Nachtblau `#26295e`, geerbt und vorläufig (Abschnitt 5) |
| alles andere | Tiefrot `#6d0818` als Rückfall |

Creme auf diesen Flächen liegt zwischen 11,2:1 und 12,6:1, Gold-200 zwischen 8,3:1 und
9,3:1; Werte im Protokoll, Abschnitt 6. Gold-700 ist dort nicht gemessen und in AP 13
nachzurechnen.

**Kennzahlen im Band**, Zahl in Gold-200, Beschriftung in Creme:

| Seite | Kennzahlen |
|---|---|
| Umfragen | Erhebungsjahr, Antworten (zählt mit den Filtern mit, wie heute), Themenbereiche |
| Statistik | Stand, Datenpunkte, Themenbereiche |

**Die Quelle ist keine Kennzahl.** Bei der Statistik steht sie in der Kategoriezeile:
„Amtliche Statistik · Bayerisches Landesamt für Statistik“. Die heutige `Stat`-Kachel mit dem
Namen des Landesamts in 36 px Serifenschrift entfällt.

**Prüfung:** kein waagrechter Überlauf bei sichtbarer Scrollleiste; Band schließt bündig an
die klebende Leiste an; 390 px: Kennzahlen umbrechen sauber.

### AP 7: Navigation, Über das Projekt, Fuß

**Soll ab 1024 px, Variante A:**

```
[Stripe 4 px an der Oberkante]
[Rose] moosburg.eu │ [Logo] Data Hub   Übersicht  Karten  Über die Daten │ (i) Über das Projekt ▾
```

- `Header.tsx` aus der Haushalt-Probe als Vorlage: Zeile 64 px, Disclosure mit Esc, Klick
  außerhalb und Fokus zurück, kein `role="menu"`.
- „Karten“ springt auf den Abschnitt der Übersicht, „Über die Daten“ ist `/about`.
- **Kein `backdrop-blur`.**
- Kopfhöhe als CSS-Variable `--kopf-hoehe`; die klebende Leiste hängt daran statt am festen
  `top-[57px]` (`Dataset.tsx:136`).
- Ab welcher Breite die Zeile passt, am gebauten Stand messen und im Ergebnis vermerken.

**Mobil:** App-Leiste mit „Data Hub“ links (verlinkt die Übersicht), rechts ein Rosen-Knopf,
der ein Blatt öffnet. Keine Tab-Leiste, es gibt nur eine Hauptansicht.

**„Über das Projekt“** (Panel rechts oben, mobil im Blatt):

- Titel „Data Hub Moosburg“
- „Umfragen, amtliche Statistik und Karten aus Moosburg, interaktiv aufbereitet.“
- „Privates Projekt, kein Auftritt der Stadt. Verbindlich sind die jeweiligen Quellen.“
- Links: Über die Daten, Impressum und Kontakt (verweist auf moosburg.eu, der Data Hub hat
  kein eigenes), Fehler melden (GitHub-Issues), Quellcode, **zurück auf moosburg.eu**

**Fuß** (`Footer.tsx`): „Data Hub der Stadt Moosburg an der Isar“ ist falsch und wird
„Data Hub Moosburg. Privat betrieben, ohne Auftrag und ohne Gewähr.“ Der Link auf
`moosburg.org` fällt ersatzlos weg, er war ein Fehler (Benedict, 17.09.2026). Der Weg zurück
auf moosburg.eu steht im Kopf, nicht im Fuß.

**Über-Seite** (`About.tsx`): Der Satz, man könne „jeden Datensatz herunterladen oder im
Methodik-Hinweis nachlesen“, wird gestrichen; beides gibt es nicht. Ebenso „offene Daten der
Stadt Moosburg“ prüfen. Ein Download bleibt als eigener Punkt aufgehoben, nicht in dieser
Probe.

**Prüfung:** Tastatur durch Kopf und Disclosure; 390 px: klebende Leiste ohne Lücke unter der
App-Leiste; Blatt über allem.

### AP 8: Kapitel-Stepper und Inhaltsverzeichnis

**Inhaltsverzeichnis**, nicht klebend, direkt unter dem Kopfband: alle Kapitel als
Sprungmarken, eine Zeile, umbrechend. Es ist der Weg für den direkten Sprung.

**Stepper**, in der klebenden Leiste, oben:

```
‹        Essen   3 von 8        ›
```

- Der linke Pfeil springt zur vorigen Kapitelüberschrift, der rechte zur nächsten. **Die
  Pfeile springen, mehr nicht**; der Name in der Mitte ist kein Knopf und öffnet keine Liste
  (Benedict, 17.09.2026: für den direkten Sprung gibt es das Inhaltsverzeichnis).
- Am ersten und letzten Kapitel wird der jeweilige Pfeil blass und ist nicht auslösbar
  (`aria-disabled`, nicht fokussierbar).
- Der Stepper erscheint erst, wenn der Kopf nach oben weggescrollt ist.
- Gezählt werden Kapitel, nicht Diagramme. Gesprungen wird auf die Überschrift, über dieselbe
  Marke wie die Anker, damit die klebende Leiste sie nicht verdeckt.
- Lange Titel („Zusammenhänge der Wichtigkeits-Bewertungen“) werden auf eine Zeile gekürzt,
  der volle Titel steht im `title` und im `aria-label`.
- **Ort vorläufig oben.** Die Alternative, den Stepper am Handy unten am Daumen zu setzen,
  ist offen und wird am gebauten Stand noch einmal angesehen (Benedict, 17.09.2026: „nur eine
  vorläufige Entscheidung, ggf. iterieren wir hier noch“).

**Prüfung:** Tastatur: beide Pfeile erreichbar, Zustand angekündigt; auf der Statistikseite
(ohne Filter) trägt der Stepper die Leiste allein; kein Sprung verdeckt eine Überschrift.

### AP 9: Filterknöpfe, Auswahlliste, Goldtöne

**Am Handy** (unter 640 px) ersetzen Knöpfe die heutige Leiste aus Mini-Diagrammen: je
Kategorie ein Knopf, immer sichtbar, in der klebenden Leiste unter dem Stepper. Der Knopf
trägt den Namen der Kategorie, sobald etwas gewählt ist die Auswahl selbst („26–40“, bei
mehreren „26–40 +1“). Darunter eine Zeile „490 von 1.656 Antworten“.

**Auswahlliste** (Variante B aus der dritten Lesung):

- Jede Zeile trägt ihren Balken als **Hintergrund der Zeile**, von links, mit dem Wert
  beschriftet.
- Die Breite skaliert auf das **Maximum aller Zeilen dieser Liste, „ohne Angabe“
  eingeschlossen**. Die größte Zeile bekommt die volle Breite (Benedict, 17.09.2026).
- **„ohne Angabe“ ist eine normale, auswählbare Zeile**, kein Sonderfall am Rand. In der
  Bahnhofumfrage ist sie bei zwei von drei Filtern die größte: 314 ohne Altersgruppe, 643
  ohne Wohnort, 650 ohne Nutzungshäufigkeit, bei 1.656 Antworten.
- Mehrfachauswahl bleibt, die Liste schließt nicht beim ersten Tipp. Unten „Auswahl
  aufheben“.

**Am Schreibtisch** bleibt die Leiste mit den kleinen Balkendiagrammen, wie sie ist. Sie
zeigt die Struktur der Stichprobe ohne einen Klick.

**Farben**, überall wo Filter gezeigt werden (Mini-Diagramme, Knöpfe, Auswahlliste):

| Zustand | Ton |
|---|---|
| ruhig | Gold-500 `#b8964e` |
| überfahren | Gold-600 `#967a40` |
| gewählt | Gold-700 `#6e5a30`, dazu 2 px Grundstrich unter dem Balken |

Rot fällt hier weg, es gehört den Daten (Likert-Rampe) und der Bedienung außerhalb der
Filter. `--color-gold-400: #b39f7a` aus `index.css` löschen. Gemessen auf Weiß: Gold-500
2,80:1, Gold-600 4,07:1, Gold-700 6,63:1; die Trennung zwischen ruhig und gewählt liegt bei
2,37:1, der heutige Sprung von Gold auf Rot bei 2,29:1.

**Prüfung:** Tastatur durch Knöpfe und Liste, Zustand angekündigt; 390 px: drei Knöpfe passen
in eine Zeile oder scrollen waagrecht; Filter über die URL funktioniert unverändert.

### AP 10: Die offenen Themen der Bahnhofumfrage

Abschnitt 3 der Bahnhofumfrage trägt `type: "open_themes"` und zehn ausgewertete Themen mit
`label`, `desc` und `icon`. Dieser Typ kommt in `src/` nirgends vor, deshalb zeigt die Seite
dort „Für diesen Abschnitt liegen noch keine Visualisierungen vor.“

Gebaut wird ein **Register**: je Thema eine Zeile mit Klecks (38 px) links, Titel in der
Titelschrift, Beschreibung darunter, Haarlinien dazwischen. Kein Diagramm, es sind keine
Zahlen.

Die Icon-Namen im Datensatz (`clean`, `tunnel` und so weiter) sind ein eigenes kleines Set
und passen nicht zu Phosphor. Zuordnung in einer Tabelle im Code, nicht im Datensatz. Die
Themen und ihre Reihenfolge bleiben unverändert.

**Prüfung:** Abschnitt zeigt zehn Themen; `Section.tsx` fällt nicht mehr in den
Platzhalterzweig.

### AP 11: Ecken und Kleinkram

- Im `@theme`-Block `--radius-lg: 8px`. `rounded-xl` ist im Kanon seit 16.09. 8 px.
  `rounded-md` (4 px) bleibt für Kleinteile.
- `src/lib/palette.ts:47-48` spiegelt die Radien für SVG (`card: 8`, `hero: 12`): beide auf 8.
- Einseitige Kanten gegenprüfen: `grep -rn "border-l-\|border-t-[2-9]" src`.
- Segmente (die Hexmap zeigt drei Ansichten): Aussehen wie in den Lesungen,
  Tastatursteuerung unverändert.

### AP 12: Die Bahnhof-Zeichnung

Sobald Benedict die Zeichnung liefert (Bahnsteig mit Schranke und Abgang zur Unterführung):

1. Aus dem Blatt eine WebP machen, die die Zeichnung allein im Alphakanal trägt: Papier
   durchsichtig, Tinte deckend. Umrechnung `Alpha = clip((230 − Luma) / 170)`, auf das Motiv
   beschneiden, auf rund 900 px lange Kante bringen, als `LA`-WebP mit Qualität 72 speichern.
   Ergibt rund 100 KB. Ablage `public/sketches/bahnhofA.webp`.
2. Im Kopfband rechts setzen, über den rechten Rand hinaus angeschnitten, in Schwarz mit etwa
   80 % Deckkraft auf der Themenfarbe. Unter 64 rem `display: none`, damit Handys die Datei
   nicht laden.
3. Prüfen, dass die Zeichnung Kennzahlen und Titel nicht kreuzt und über keinem Element
   liegt, das eine Position braucht. Lehre aus dem Portal: Eine absolut gesetzte Zeichnung
   liegt sonst über Geschwistern ohne `position`, dort hat sie den Stripe angefressen.

Volksfest und Bevölkerungsstatistik folgen später, gleiches Verfahren.

### AP 13: Nachher-Stand, Auswertung, Protokoll

1. Nachher-Screenshots wie AP 0 nach `docs/formsprache-probe/nachher/`, Paare nach
   `nachher/paare/`.
2. `docs/formsprache-probe/ERGEBNIS.md` nach dem Muster von Portal und Stadtrat, mit den
   Kontrastwerten aus AP 4, AP 6 und AP 9.
3. Protokoll `../moosburg-design/docs/formsprache/ENTSCHEIDUNGEN.md`, Abschnitt „Verlauf“:
   Datum, Branch, Commits, Verweis aufs Ergebnis. Entscheidungen nicht auf endgültig setzen.

**Abschlussprüfung, alle grün:**

- [ ] `pnpm typecheck`, `pnpm build`, `pnpm build:hostinger`
- [ ] `grep -rn "eyebrow\|uppercase\|Inter Variable" src` ohne unkommentierte Treffer
- [ ] gerenderte Schriften, auch in den Diagrammen, nur die drei neuen
- [ ] kein Komma als Tausendertrenner in der Oberfläche
- [ ] Vorschau unter `/datahub/` und `/data/` lädt, Datensatz-Routen funktionieren
- [ ] 390 px: kein waagrechter Scroll, klebende Leiste sitzt richtig, Register ohne Rahmen
- [ ] Tastatur: Kopf, Disclosure, Stepper, Filterknöpfe, Auswahlliste, Hilfe-Popover
- [ ] `ChartTable`-Zwillinge vorhanden
- [ ] 200 % Zoom: Titel mit Überlappung lesbar
- [ ] Vorher/Nachher vollständig, `ERGEBNIS.md` geschrieben, Protokoll nachgeführt

---

## 5. Offen, und was Benedict noch liefert

- **Die Bahnhof-Zeichnung.** Quadratisch, mindestens 2000 px, schwarze Tusche auf hellem
  Papier, reine Strichzeichnung ohne graue Lavierung, Motiv eher links im Blatt (der rechte
  Rand wird angeschnitten), kein Rahmen, kein Schriftzug.
- **Ort des Steppers** am Handy: oben in der Leiste (so gebaut) oder unten am Daumen. Am
  gebauten Stand noch einmal ansehen.
- **Farbe der Wahlseite.** Sie erbt das Band. Nachtblau ist gesetzt, weil es auf der
  Vorschlagsseite für die Kommunalwahl vorgesehen war; entschieden ist es nicht. Fällt in die
  Wahl-Runde.
- **Die Null mit Schrägstrich** in Atkinson, auch in Jahreszahlen: im Stadtrat bleibt sie,
  hier also auch. Falls sie in den Diagrammen stört, im Ergebnis vermerken.
- **Download der Datensätze** als eigener Punkt, nicht in dieser Probe.
- **`&` in Kapiteltiteln** („Bedürfnisse & Anforderungen“, „Programm & Fahrgeschäfte“). Die
  Titel stehen in den JSON-Dateien und werden von Skripten erzeugt. Nicht anfassen, aber
  gemeldet.

## 6. Nicht Teil dieser Probe

Dunkelmodus; Farben und Formen der Diagramme (Daten-Palette, Likert-Rampe); Filterlogik;
ETL-Skripte und JSON unter `public/data/`; die Zähler-Einbindung (offen laut `PLATTFORM.md`,
eigener Commit); die Wahlseite über das Geerbte hinaus; die Karten-Apps; die Abweichungen von
der Hausbasis.
