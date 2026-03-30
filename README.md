# Moosburg Data Hub

Interaktives Umfrage-Dashboard für die Stadt Moosburg a.d. Isar.

## Struktur

```
moosburg-data-hub/
├── index.html                          ← Einzige HTML-Datei, kein Build-Schritt
└── data/
    ├── christkindlmarkt_2025.json      ← Umfragedaten Christkindlmarkt
    └── website_innovationen_2025.json  ← Umfragedaten Website Innovationen
```

## Deployment auf GitHub Pages

1. Dieses Repo auf GitHub pushen (oder Dateien direkt hochladen)
2. **Settings → Pages → Source:** `Deploy from a branch` → Branch `main`, Ordner `/root`
3. Speichern — die Seite ist nach ~1 Minute unter `https://<nutzer>.github.io/<repo>/` erreichbar

> **Hinweis:** Die JSON-Dateien werden per `fetch()` nachgeladen.  
> GitHub Pages serviert sie automatisch korrekt — lokal muss ein kleiner HTTP-Server  
> genutzt werden (z.B. `python3 -m http.server` im Projektordner), da Browser `fetch()`  
> auf `file://`-URLs blockieren.

## Neuen Datensatz hinzufügen

1. JSON-Datei in `data/` ablegen (Array von Arrays, eine Zeile = ein Datensatz)
2. In `index.html` → `DATASET_DEFS` einen neuen Eintrag analog zu den bestehenden ergänzen
3. Commit & Push — fertig
