# Offene Punkte

*Notiert am 26.08.2026 fuer spaetere Sitzungen. Erledigte Punkte bitte streichen,
nicht abhaken — die Datei soll kurz bleiben.*


## Einwohnerreihe gehoert hierher

`datahub` ist nach der Datenhoheit die Quelle fuer amtliche Statistik, fuehrt aber
bisher nur „Statistik kommunal 2022" mit Stand 31.12.2021 (19.309 Einwohner). Die
fortgeschriebene Reihe aus GENESIS-Online liegt in `haushaltvis/etl/context.yaml`
und reicht bis **20.107 zum 31.12.2025**.

Der Stadt-Prototyp zeigt seit dem 26.09.2026 die neuere Zahl mit Quelle
(Benedicts Entscheidung: die Reihe wandert nach `datahub`, die Zahl gilt sofort).
Solange sie hier nicht liegt, hat der Prototyp eine Zahl, die die Autoritaet
nicht kennt — genau der Zustand, den die Datenhoheit verhindern soll.

Zu tun: Reihe als eigenen Datensatz aufnehmen, ETL aus GENESIS-Online statt aus
`haushaltvis` abgeleitet, und den Prototyp auf diese Quelle verweisen lassen.

**Auffaellig und vor der Veroeffentlichung zu pruefen:** Der Stand 31.12.2022 liegt
mit 18.681 unter 2021 und unter 2023. Das ist vermutlich die Zensus-Korrektur 2022
und darf nicht ungeprueft als Bevoelkerungsrueckgang dargestellt werden.

## Toolchain-Stand

Dieses Repo laeuft seit dem 26.08.2026 auf **pnpm** (nicht npm) und auf der
projektweiten Hausbasis. **Die Zielversionen stehen nicht hier**, sondern in
`hausbasis/baseline.json` — eine Quelle statt einer Tabelle je Repo. Abgleich:

```bash
node ../hausbasis/check.mjs --kurz
```

Der Sinn ist Deduplizierung: alle Repos teilen sich einen pnpm-Store, der genau so
weit dedupliziert, wie die Versionen uebereinstimmen. Gemessen kostet ein Repo mit
abweichenden Versionen ~158 MB, ein Versions-Zwilling ~8 MB. **Einzelne Pakete
also nicht im Alleingang hochziehen** — das faellt allen anderen Repos zur Last.

## Warum `baseUrl` aus der tsconfig verschwunden ist

TypeScript 7 hat die Option entfernt (Fehler TS5102). Die Zeile
`"baseUrl": "."` wurde ersatzlos gestrichen — `paths` loest TS 7 relativ zur
tsconfig-Datei auf, die Eintraege stimmen unveraendert weiter. **Nicht
"reparieren", indem `baseUrl` wieder eingetragen wird.**

## Zwei Deploy-Wege

GitHub Pages und moosburg.eu/data/ via FTP, mit unterschiedlichem `--base`.
Nach einem Update `pnpm run build` **und** `pnpm run build:hostinger` pruefen —
die CI faehrt beide Workflows.

## Beim naechsten Paket-Update

Weder `pnpm install` noch `pnpm prune` raeumt die alte Version aus
`node_modules/.pnpm`. Nach einem Upgrade deshalb:

```bash
rm -rf node_modules && pnpm install
pnpm store prune
```

Ohne diesen Schritt bleibt der Speichergewinn auf dem Papier. In den beiden
Upgrade-Wellen am 26.08.2026 hat das zusammen ~1,2 GB freigegeben.
