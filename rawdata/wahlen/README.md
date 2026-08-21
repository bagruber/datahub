# Wahlergebnisse

Kopien aus dem Schwesterprojekt
[bagruber/elections](https://github.com/bagruber/elections). Dort werden die
amtliche Statistik (GENESIS-Online, Landesamt für Statistik) und die
Veröffentlichungen der Gemeinde- und Kreiswahlleitungen zusammengeführt und
gegeneinander geprüft; dort wird auch die Hexagon-Aufteilung einmal
vorgerechnet.

| Datei | Herkunft |
|---|---|
| `*-gemeinderat.json` | `data/wahlen/` — Ergebnis je Gemeinde, Sitze und gewichtete Stimmen, samt der Gewählten |
| `*-kreistag.json` | `data/wahlen/` — dieselbe Struktur für die Kreistagswahl |
| `*-kartogramm.json` | `data/kartogramm/` — fertige Zeichenware: Mittelpunkte, Umrisse, Beschriftungsanker |

Erneuern heißt: dort `npm run hole && npm run baue && node scripts/kartogramm.mjs <id>`
laufen lassen, die drei Dateien hierher kopieren, dann `node scripts/build-wahlen.mjs`.
