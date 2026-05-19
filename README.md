# Moosburg Data Hub

Interaktives Umfrage- und Daten-Dashboard für die Stadt Moosburg a.d. Isar.
Aufbereitete Rohdaten (z.B. aus Bürger:innen-Umfragen) als nachvollziehbare,
filterbare Visualisierungen — ohne PDF-Tabellen, ohne Excel-Klicki.

> ⚠️ **Hinweis:** Dieses Projekt ist eine **private Eigenentwicklung**, nicht
> offiziell durch die Stadt Moosburg beauftragt. Inhalte wurden sorgfältig
> aufbereitet — im Zweifel sind die zugrundeliegenden Rohdaten verbindlich.
> Wünsche, Bug-Reports und Datenanfragen gerne jederzeit als
> [GitHub-Issue](https://github.com/bagruber/datahub/issues) oder per Mail.

## Stack

- React 19 + React Router 7 + TypeScript
- Vite als Build-Tool
- Tailwind CSS v4
- [Observable Plot](https://observablehq.com/plot/) und D3 für Visualisierungen
- Statische Rohdaten in `rawdata/` (CSV), aufbereitet in `src/`

## Lokal entwickeln

```bash
npm install
npm run dev        # Dev-Server auf http://localhost:5173
npm run build      # Produktions-Build nach dist/
npm run typecheck  # nur tsc, kein Build
```

## Geschwister-Apps

Teil einer kleinen Familie von Anwendungen rund um Transparenz und Datenarbeit
in der Kommune Moosburg:

- **[bagruber/council](https://github.com/bagruber/council)** — Stadtrats-
  Transparenz-App mit Themen, Sitzungen, Voten und Mitglieder-Profilen
  ([Live](https://bagruber.github.io/council/)).
- **[bagruber/council-voting-tool](https://github.com/bagruber/council-voting-tool)** —
  Live-Erfassung von Anwesenheit und Abstimmungen während der Sitzung.
- **bagruber/datahub** *(dieses Repo)* — Daten-Dashboards.

Designsprache (Moosburg-Rot, Gold-Akzent, warmes Off-White) ist über alle
drei Apps konsistent.

## Verantwortung

Entwickelt und betrieben von **Benedict Arya Gruber**, von 2022 bis 2026
Digitalisierungsreferent der Stadt Moosburg a.d. Isar und Stadtrat (fresh).
Eine private Eigenentwicklung — kein offizielles Produkt der Stadtverwaltung.

Kontakt: [benedict.gruber@fresh.bayern](mailto:benedict.gruber@fresh.bayern) ·
[gruber.am](https://www.gruber.am)

Lizenz: MIT.
