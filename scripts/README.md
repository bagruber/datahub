# scripts/

Build-time helpers. None of these run in the browser; they shape the JSON
files under `public/data/` that the app fetches.

| Script | When to run | What it does |
|---|---|---|
| **`build-volksfest.mjs`** | Whenever `rawdata/volksfestroh.csv` changes (new responses, schema tweaks) or the Volksfest dataset structure is edited | Parses the CSV with a tiny RFC-4180 parser, normalises multi-select strings into code arrays, derives the codebook + age bins, emits `public/data/volksfest_2024.json`, and updates `public/data/manifest.json`. Free-text fields (`erreichbarkeit_kommentar`, `rahmenprogramm`, …) are preserved verbatim on each record. The Volksfest section/chart structure and the press list are baked into this script — edit here, not the JSON. |
| **`build-wahlen.mjs`** | Wenn die Dateien in `rawdata/wahlen/` erneuert wurden | Baut `public/data/kommunalwahl_2026.json` aus den Ergebnissen und der vorgerechneten Hexagon-Geometrie des Schwesterprojekts [bagruber/elections](https://github.com/bagruber/elections). Gerechnet wird hier nichts mehr — dort werden amtliche Statistik und die Veröffentlichungen der Wahlleitungen zusammengeführt und gegeneinander geprüft, dort entsteht auch die Aufteilung der Sechsecke. Dieses Skript formt daraus nur den Datensatz: einen `hexmap`-Chart für den Landkreis und je einen `gremium`-Chart für die Räte mit namentlich bekannten Gewählten. |
| **`apply-section-texts.mjs`** | After authoring/editing the per-section insight texts | Idempotent patch: opens `christkindlmarkt_2025.json`, `fahrgastumfrage_2023.json`, and `website_innovationen_2025.json`, replaces each section's `text` field, and (for Website Innovationen) merges the "Detail" + "Vergleich" sections into one. Volksfest's text lives in the build script above, so it's not touched here. |
| **`stats-insights.mjs`** | Read-only analysis | Prints aggregate numbers per section across all four datasets (means, top-share, demographic splits). Used to find concrete numbers for the section insight texts. Doesn't write anything. |

## Conventions

- All scripts are ES modules, run with `node scripts/<name>.mjs`. No deps beyond Node's `fs`/`path`.
- File paths are computed relative to repo root via `fileURLToPath(import.meta.url)`, so they work regardless of where you invoke node from.
- JSON is written **without indentation** (`JSON.stringify(d)`) to keep file size small for shipping; `manifest.json` is the exception (`null, 2`) because it's hand-readable.

## Adding a new dataset from CSV

Pattern is `build-volksfest.mjs`:

1. Drop the CSV in `rawdata/<name>.csv`.
2. Copy the volksfest script to `build-<name>.mjs`.
3. Adjust the codebook, the field mapping (`records.map(...)`), filters, and sections.
4. Add a `meta` block + the manifest entry write at the bottom.
5. Run it; verify the JSON loads on the dataset page.

If a third or fourth CSV-based dataset ever shows up, factor out the CSV
parser + manifest update into a `lib/csv-to-dataset.mjs` shared module.
Until then, copy-paste-tweak is fine.
