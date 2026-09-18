# Diagramme im Data Hub: Ergebnis der Umsetzung

*Stand 18.09.2026. Gebaut auf `probe/diagramme`, abgezweigt von `probe/formsprache`.
**Noch nicht gemergt und nicht gepusht.** Grundlage sind die drei Lesungen:
[erste](https://claude.ai/artifact/GzS2QsS4DaGV81u9bpXdVd),
[zweite](https://claude.ai/artifact/NY9ombMSL1RtjmjxfP9nAa),
[dritte](https://claude.ai/artifact/RGoMTMAxdu8e6kBvNR7tRP). Alle Entscheidungen sind
vorläufig; Kanon ist `../moosburg-design/css/theme.css`.*

Bilder aller Diagramme in 1440 und 390 px liegen lokal unter `bilder/`
(per `.git/info/exclude` ausgenommen).

## Was jetzt gilt

| AP | Umsetzung |
|---|---|
| 1 | **Farben nach Aufgabe**, aus `src/lib/palette.ts`. Unterscheiden: sechs Töne, feste Reihenfolge. Werten: Rot gegen Isar-Blau. Ordnen: Gold in Stufen mit neutraler Mitte. Eine einzelne Reihe trägt Isar-Blau. Die Hexwerte in `public/data/*.json` werden ignoriert; `color` und `colors` werden nicht mehr durchgereicht. |
| 2 | **Basiszeile** unter jedem Diagrammtitel: Antwortzahl, Mehrfachnennung, Skala. Sie zählt mit den Filtern mit (`src/lib/basis.ts`). **Tabelle für alle**, aufklappbar wie im Haushalt. |
| 3 | **Achsen und Gitter**: Haarlinien, keine Tickstriche, Achsentitel ohne Pfeil (die Einheit steht als leise Zeile über dem Diagramm), ruhige Nulllinie. Wo jeder Balken seinen Wert trägt, entfällt die Werteachse. **Prozent ohne Leerzeichen.** |
| 4 | **Skalen**: beschriftete Leiste mit Kerbe statt Nummernlegende, Kerben statt Mittellinie, links und rechts die Summe der Seite, darunter eine feine Skala mit dem **arithmetischen Mittel**. Gilt für Bewertungen und Preise. |
| 5 | **Balken und Säulen**: runde Spitze, eckige Basis, höchstens 20 px dick; Säulen auf 70 % der Bandbreite. Am Handy werden Säulen zu Balken. |
| 6 | **Ring** dünner, Mitte in Satzschreibung. |
| 7 | **Korrelation**: untere Dreieckshälfte ohne Diagonale, Zahl ab ,30 und bei gegenläufigen ab −,20. Am Handy stehen die Namen auf der Diagonale. Eigene Legende statt der von Plot. |
| 8 | **Spinnennetz zum Ausklappen**: eingeklappt ein Netz mit Linien ohne Flächen, ausgeklappt ein kleines Netz je Idee mit dem Durchschnitt aller grau dahinter. |
| 9 | **Venn flächentreu mit Schraffur**: zwei Mengen als Kreise, drei Mengen als Ellipsen aus einem Löser (`src/lib/vennEllipsen.ts`). Schnittmengen tragen die Streifen ihrer Mengen, die Mitte alle drei. |
| 10 | **Linien** mit Name und letztem Wert am Ende; bei zwei Reihen Blau und Gold. **Gestapelte Säulen** schmaler, mit Fuge und Direktbeschriftung der großen Segmente. |

## Der Ellipsen-Löser

Drei Ellipsen, fünfzehn Parameter, gesucht mit einem Simplex-Verfahren auf einem
Raster; die Kosten wiegen kleine Gebiete relativ, sonst gehen sie neben den großen
unter. Gemessen am eigenen Rechner:

| Datensatz | Dauer | größte Abweichung |
|---|---|---|
| Volksfest, Tageszeiten (5 bis 68 Personen je Gebiet) | rund 200 ms | 0,30 Personen |
| gleich große Mengen | rund 100 ms | 0,07 |
| stark ungleiche Testmengen | rund 200 ms | 0,08 |

Die Suche läuft im Browser und nur, wenn sich die Zahlen ändern, also beim Filtern.
Findet sie keine Lage mit weniger als einem Prozent Abweichung, zeichnet das Diagramm
schematische Kreise mit dem Hinweis „Größen nicht maßstäblich“. **In der dritten Lesung
stand „wenige Millisekunden“; richtig sind rund 200 ms.** Das ist beim Filtern spürbar,
aber nicht störend; wenn es stört, gehört die Suche in einen Web Worker.

## Prüfungen

- `pnpm typecheck`, `pnpm build`, `pnpm build:hostinger` grün.
- 390 px: kein waagrechter Überlauf auf Übersicht, den drei Datensatzseiten und `/about`.
- Keine abgeschnittenen Beschriftungen mehr in den SVG-Diagrammen (vorher: Legende der Korrelation, Achsen des Spinnennetzes).
- Kein Komma als Tausendertrenner; Prozent durchgehend ohne Leerzeichen.
- Gerenderte Schriften nur die drei der Formsprache.
- Jedes Diagramm hat seine Tabelle, jetzt sichtbar aufklappbar.

## Abweichungen und offene Punkte

- **Die Kurven waren schon richtig.** In der ersten Lesung stand, die Linien seien
  geglättet und erfänden Zwischenwerte. Tatsächlich nutzt `LineSeries` seit jeher
  `curve: "monotone-x"`, und die schwingt nicht über. Geändert wurden nur Farben,
  Endbeschriftung und Achsen.
- **Der Ring bleibt für alle Kreisdiagramme.** Die Entscheidung, geordnete Antworten
  (Wartezeit) stattdessen als Anteilsbalken zu zeigen, braucht ein Feld im Datensatz,
  das sagt, ob die Antworten geordnet sind. Die JSON-Dateien erzeugen die Skripte;
  das gehört in die ETL-Runde, nicht hierher.
- **Handschriftliche Notizen sind noch nicht gebaut.** Variante C (von Hand im
  Datensatz, dazu die Einstiegsnotiz an der Filterleiste) verlangt ebenfalls ein neues
  Feld in den JSON-Dateien. Vorschlag: zusammen mit der ETL-Runde.
- **Tooltips** kommen weiter von Observable Plot (`tip: true`), nicht aus einem eigenen
  Bauteil. Sie sind gestylt, erscheinen sofort und lesen die Schrift der Seite; die
  eigenen SVG-Diagramme (Ring, Venn, Spinnennetz) haben ihre eigenen Zustände. Ein
  einheitliches eigenes Tooltip-Bauteil wäre eine eigene Runde.
- **Alterspyramide je Jahrgang** (ungleich breite Altersgruppen) ist nicht umgesetzt;
  die Frage stand in der ersten Lesung offen.
- **Hexmap und Gremium** der Wahlseite sind unverändert.
