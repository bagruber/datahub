# Wahlergebnisse

Kopien aus dem Schwesterprojekt
[bagruber/elections](https://github.com/bagruber/elections). Dort werden die
amtliche Statistik (GENESIS-Online, Landesamt für Statistik) und die
Veröffentlichungen der Gemeinde- und Kreiswahlleitungen zusammengeführt und
gegeneinander geprüft; dort wird auch die Hexagon-Aufteilung einmal
vorgerechnet.

| Datei | Herkunft |
|---|---|
| `*-gemeinderat.json` | `data/wahlen/`, Ergebnis je Gemeinde, Sitze und gewichtete Stimmen, samt der Gewählten |
| `*-kreistag.json` | `data/wahlen/`: dieselbe Struktur für die Kreistagswahl |
| `*-kartogramm.json` | `data/kartogramm/`, fertige Zeichenware: Mittelpunkte, Umrisse, Beschriftungsanker, je Bezugsgröße ein Raster |

Erneuern heißt: dort `npm run hole && npm run baue && node scripts/kartogramm.mjs <id>`
laufen lassen, die drei Dateien hierher kopieren, dann `node scripts/build-wahlen.mjs`.

## Was in den Dateien steckt, das man kennen muss

**`listen` sind Gruppen, `ergebnis` sind Einzellisten.** Neben den gesetzten
Parteifarben lassen sich auf cremefarbenem Grund nur vier weitere Farben
unterbringen, die sich zuverlässig unterscheiden; im Landkreis Freising treten
einunddreißig örtliche Listen an. Die Kreislegende fasst deshalb zusammen: die
Freien Wähler zu einer Zeile, die gemeinsamen Wahlvorschläge zu einer, und
Wählergruppen mit einem einzigen Sitz in einer einzigen Gemeinde zu einer. Jeder
Eintrag in `ergebnis` verweist über `gruppe` auf seine Zeile; woraus eine Gruppe
besteht, steht dort in `teile`.

**`veraenderung` gibt es nur für die Kreistagswahl.** Die Ergebnisseiten führen
alle eine Spalte „Gewinn und Verlust in %-Punkten", und die stimmt nicht: in
Allershausen etwa steht dort für die AfD −16,8 Punkte, während dieselbe Seite in
ihrer Vergleichsgrafik 4,1 Prozent für 2020 und 10,4 Prozent für 2026 ausweist.
Das Schwesterprojekt rechnet die Veränderung deshalb aus der Grafik. Die
Gemeindeseiten haben keine solche Grafik, also lässt sich dort nichts
nachrechnen, und es steht auch nichts im Datensatz.

**Zwei Raster.** `raster.sitze` legt ein Sechseck je Ratssitz, `raster.einwohner`
eines je 500 Einwohner. Auf einen Sitz kommen in Freising 1223 Einwohner und in
Gammelsdorf 133: die kleinen Gemeinden schrumpfen beim Umschalten also auf ein
Neuntel. Auf der Einwohnerkarte hat ein Feld keine Entsprechung im Gremium; die
Felder fallen dort nach Stimmenanteil, und `grundlage.genau` steht auf falsch.

**`herkunft`** trägt je Ebene, wie viele Gemeinden welche Art von Angabe haben.
Die Karte zeigt das unter „Woher die Zahlen kommen"; es ist keine Fußnote,
sondern der Vorbehalt zum Gezeigten.
