# Formsprache im Data Hub: Ergebnis der Probe

*Stand 17.09.2026. Gebaut auf `probe/formsprache`, **noch nicht gemergt**; Merge und
Push erst nach Freigabe durch Benedict. Die Entscheidungen sind **vorläufig**: Kanon
ist allein `../moosburg-design/css/theme.css`, das Protokoll dort führt den Verlauf.*

Grundlage: `docs/briefing-formsprache.md` (AP 0 bis 13) und die drei Lesungen
([erste](https://claude.ai/artifact/7yJQBjHVUt2bakmAsVmTXY),
[zweite](https://claude.ai/artifact/K7x9KzUVvjAkREAmkvehPR),
[dritte](https://claude.ai/artifact/D8g4dAkGrFwFzDtMyqtHjT)). Vorher- und
Nachher-Aufnahmen in 1440 und 390 px liegen lokal unter `vorher/`, `nachher/` und
`nachher/paare/` (per `.git/info/exclude` ausgenommen), aufgenommen unter `/data/`.

## Was jetzt gilt

| Bereich | Umsetzung | Commit |
|---|---|---|
| Kanon | Lockfile auf den Kanon-Stand `cd312fa` gezogen, damit `rounded-xl` hier 8 px ist. Der Zug bringt nur diese eine Änderung mit. | `69f451a` |
| Schriften | Source Serif 4, Atkinson Hyperlegible Next, Madelon Script. Die acht Diagramme und die Legenden von Observable Plot lesen `--font-sans`. Gerendert werden nur noch die drei neuen, auch im SVG. | `8c77a9a` |
| Zahlen | `fmtInt` über `Intl.NumberFormat("de-DE")`; Kennzahl mit der Zahl zuerst; `ArrowLeft` statt „←“. | `c833cf5` |
| Versalien | keine mehr, `.eyebrow` gelöscht. „Pressestimmen“ ist jetzt die h2 selbst, die zweite Überschrift „In den Medien“ ist entfallen. | `a209f5b` |
| Kacheln | Klecks 46 px, Kategoriezeile, Titel, Anzahl über einer Haarlinie. Alle drei Gründe bleiben ab 640 px. Darunter Register ohne Rahmen. Hover wie im Haushalt. | `a9d08b4` |
| Kopf der Übersicht | „nachgefragt“ über dem Titel, `buechereiA` ab 1280 px in Gold rechts unten angeschnitten, Rose als Logo-Platz, neuer Lead. | `74e3192` |
| Kopfband | volle Breite in der Themenfarbe, Rücklink, Kategoriezeile (bei der Statistik mit Quelle), Titel, Beschreibung, Kennzahlen als Zeile. Die Stat-Kacheln sind entfallen. | `da1eb77`, `f469131` |
| Zeichnung | Bahnhof als WebP mit dem Motiv allein im Alphakanal, 900 px, 88 KB. Ab 64 rem kleiner, ab 80 rem voll, darunter ausgeblendet und dann nicht geladen. | `b11ada3` |
| Navigation | Variante A ab 1024 px, App-Leiste mit Rosen-Knopf und Blatt darunter. Kein `backdrop-blur`, `--kopf-hoehe` statt `top-[57px]`. Fuß korrigiert, `moosburg.org` entfernt, Über-Seite ohne Download- und Methodik-Versprechen. | `cbc0fff` |
| Orientierung | Inhaltsverzeichnis unter dem Band, Stepper in der klebenden Leiste. Er erscheint erst, wenn die Leiste klebt. | `53158c2` |
| Filter | Am Handy Knöpfe mit Auswahlliste, „ohne Angabe“ als normale Zeile; Goldtöne statt Rot in allen Filterbalken; `--color-gold-400` entfernt. | `53158c2` |
| Offene Themen | Register mit zehn Themen, Klecks in der Themenfarbe. | `f25f8f5` |
| Ecken | `--radius-lg` 8 px, SVG-Radien nachgezogen; Segmente der Hexmap als helle Schiene mit weißem gewähltem Feld. | `812117c` |

## Auslegungen, die Benedict ansehen sollte

- **Kategoriezeile ohne Icon neben dem Klecks.** Auf Kacheln und im Register trägt
  der Klecks das Icon; zweimal dasselbe Zeichen nebeneinander wirkte doppelt. Im
  Kopfband, wo kein Klecks steht, hat die Zeile ihr Icon.
- **Auswahlliste mit getöntem Grund.** Text auf Gold-700 wäre unlesbar. Wie in der
  Attrappe B der dritten Lesung liegt der Balken als Tönung (`#f4ecdc` ruhig,
  `#e6dcc2` gewählt); Gold-500 und Gold-700 stehen als 2-px-Grundstrich an seiner
  Unterkante. Gewählt heißt zusätzlich fett mit Häkchen.
- **„ohne Angabe“ erweitert die Filterlogik**, obwohl sie laut Briefing nicht Teil
  der Probe ist. Die Zeile ist ein Index hinter der letzten Option, bestehende
  Filter-URLs behalten ihre Bedeutung. Am Schreibtisch bleibt die Leiste wie sie
  war und zeigt „ohne Angabe“ nicht; eine URL mit dieser Auswahl filtert dort
  richtig, markiert aber keinen Balken.
- **moosburg.eu steht im Panel als erster Eintrag**, wie im Stadtrat und nach der
  Familienregel im Protokoll. Das Briefing nannte ihn zuletzt.
- **Kein Abdunkeln mehr** der nicht gewählten Filterbalken. Die Tabelle kennt nur
  ruhig, überfahren, gewählt.
- **Die Zeichnung ist ein Beispiel** und wird ersetzt, wenn die endgültige kommt.
  Das Verfahren steht in AP 12 des Briefings; die Umrechnung lief unverändert.

## Messwerte

**Kopfzeile Variante A** passt ab 1024 px ohne Kürzung.

**Kontrast** (WCAG 2.1):

| Stelle | Wert |
|---|---|
| Purpur `#6b3e7a` auf Creme / auf der dunkelsten Schraffurlinie | 7,57:1 / 6,93:1 |
| Gold-700 auf Gold-100 (Kategoriezeile Statistik) | 5,64:1 |
| ink-soft auf Gold-100 | 6,35:1 |
| Klecks-Icon auf Klecks: Rot / Gold / Purpur | 6,52 / 4,57 / 5,63:1 |
| Band Isar-Petrol: Creme / Gold-200 / Rücklink Creme 85 % | 11,23 / 8,27 / 8,58:1 |
| Band Tiefrot | 11,57 / 8,53 / 8,58:1 |
| Band Gold-700 | **6,20 / 4,57 / 5,00:1** |
| Band Nachtblau (Wahl, geerbt) | 12,59 / 9,27 / 9,50:1 |
| Filterknopf gesetzt: Gold-700 auf Gold-100 | 5,64:1 |
| Auswahlliste: ink-muted auf `#f4ecdc` / Gold-700 auf `#e6dcc2` | 4,52 / 4,85:1 |
| Grundstrich Gold-500 gegen Zeilengrund | 2,38:1 |

Das Band in Gold-700 trägt deutlich weniger als die dunklen Themenfarben: Gold-200
darauf liegt mit 4,57:1 knapp über der Grenze.

## Prüfungen

- `pnpm typecheck`, `pnpm build`, `pnpm build:hostinger` grün.
- `grep -rn "eyebrow\|uppercase\|Inter Variable" src`: nur die beiden kommentierten
  Zeilen in `Gremium.tsx` und `Hexmap.tsx` (Wahl-Runde).
- Unter `/datahub/` und `/data/` laden Übersicht, alle vier öffentlichen
  Datensatzseiten und `/about`; keine 404, keine Konsolenfehler; geladene Schriften
  nur die drei neuen.
- Kein Komma als Tausendertrenner in Text, SVG und Tooltips.
- 390 px: kein waagrechter Überlauf; Register ohne Rahmen; klebende Leiste bündig
  unter App-Leiste (61 px) und Kopf (69 px).
- Tastatur: Disclosure (Enter, Esc, Klick außerhalb, Fokus zurück), Stepper (Pfeile
  am Ende `aria-disabled` und nicht fokussierbar), Filterknöpfe und Auswahlliste
  (Fokus springt beim Öffnen in die Liste, `aria-pressed`, Esc zurück zum Knopf).
- Stepper auf allen drei Seiten, auf der Statistik allein in der Leiste; beim
  Erscheinen verschiebt sich der Inhalt nicht; nach dem Sprung liegt die Überschrift
  unter der Leiste.
- Filter über die URL wie vorher, dazu „ohne Angabe“: `moosburg=2` ergibt 643,
  `moosburg=0,2` ergibt 1.483 Antworten. Zählung „ohne Angabe“: 314, 650, 643.
- `ChartTable`-Zwillinge vorhanden (9, 13, 7 und 5 Tabellen).
- 200 % Zoom entspricht bei 1440 px einer Breite von 720 px: Zeichnung aus, Titel
  mit Handschrift lesbar.

## Gefundene Fehler und offene Punkte

- **Alters-Filter über die URL geht beim Laden verloren** (vorbestehend, nicht
  geändert). Das Weiterleitungs-Skript in `index.html` prüft `q.indexOf("p=")` und
  trifft damit auch `age_group=`; es ersetzt die URL dann durch den leeren
  `p`-Parameter. Betrifft jeden Filterschlüssel, der auf „p“ endet.
- **Einseitige rote Kante** am Hinweis der Hexmap (`Hexmap.tsx:146`), nicht
  angefasst, Wahl-Runde.
- **Abgeschnittene Beschriftungen** (vorbestehend, mit Atkinson eher weniger):
  Legende der Korrelation (−1,0 und 1,0, Achsentitel), am Handy einzelne
  Radar-Achsen („Steckdosen“, „Sicherheit“).
- **Über-Seite:** „offene Daten der Stadt Moosburg“ steht noch da; Formulierung
  offen. Ebenso die `meta description` in `index.html` („der Stadt Moosburg“).
- **Quelle der Statistik** steht im Datensatz abgekürzt („Bayer. Landesamt für
  Statistik“); nicht geändert, weil die Texte aus den Skripten kommen.
- **`d3-format`** wird nicht mehr importiert, bleibt aber in der `package.json`
  (keine Paketänderung außerhalb der Probe).
- **Klebende Leiste am Schreibtisch** ist mit Stepper rund 330 px hoch; bei 900 px
  Fensterhöhe verdeckt sie ein gutes Drittel. Zusammen mit dem offenen Ort des
  Steppers am gebauten Stand ansehen.
- **Null mit Schrägstrich** ist in Jahreszahlen und Diagrammwerten sichtbar
  („2023“, „4,0“), stört aber nicht erkennbar.
- **`&` in Kapiteltiteln** steht jetzt auch im Inhaltsverzeichnis und im Stepper.
- **Madelon Script:** Lizenz weiter ungeklärt.
- **Zeichnungen für Volksfest und Bevölkerungsstatistik** folgen.
