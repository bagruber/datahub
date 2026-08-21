# Plattform-Kontext

Wo diese App läuft und was beim Ändern zu beachten ist. Der übergreifende
Kontext steht im Repo `bagruber/moosburg-eu` in `BRIEFING.md`.

*Stand: August 2026*

---

## Zwei Adressen, zwei Builds, ein Branch

| | Adresse | Basispfad | Build |
|---|---|---|---|
| GitHub Pages | `bagruber.github.io/datahub/` | `/datahub/` | `npm run build` (`.github/workflows/deploy.yml`) |
| moosburg.eu | `moosburg.eu/data/` | `/data/` | `npm run build:hostinger` (`hostinger.yml`) |

Beide Workflows hängen an `main`. Ein Push löst beide aus; sie stören sich
nicht, weil nur einer FTP nutzt.

Der Basispfad steht **nicht** in `vite.config.ts`, sondern kommt für Hostinger
aus einem eigenen Script-Eintrag:

```json
"build:hostinger": "tsc -b && vite build --base=/data/"
```

Grund: Pages braucht den Repo-Namen als Pfad, moosburg.eu nicht. Eine Änderung
an `base` in der Config würde immer eine der beiden Varianten brechen.

## Drei Fallen, alle schon einmal zugeschnappt

### 1. Der `basename` des Routers

`src/routes.tsx` nutzt `createBrowserRouter`. Der `basename` **muss** aus
`import.meta.env.BASE_URL` kommen:

```js
{ basename: import.meta.env.BASE_URL.replace(/\/$/, "") }
```

War er fest verdrahtet (`"/datahub"`), passte er unter `/data/` zu keiner
Route — React Router rendert dann nichts und die Seite bleibt **komplett
weiß**. Das Tückische: keine Fehlermeldung, keine Exception, alle Assets laden
mit 200. Wer eine leere Seite sieht, prüft zuerst diesen Wert.

`BASE_URL` endet auf `/`, `basename` erwartet es ohne — daher das `replace`.

### 2. Der SPA-Fallback braucht einen Endungs-Guard

Echte Pfade statt Hash-Routing heißt: Der Server muss unbekannte Pfade auf
`index.html` umschreiben. Der Workflow erzeugt dafür eine `.htaccess`. Der
404.html-Trick im Repo löst das nur für GitHub Pages.

Entscheidend ist die vorletzte Zeile:

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !\.[a-zA-Z0-9]{2,5}$
RewriteRule . /data/index.html [L]
```

Ohne die dritte Bedingung beantwortet der Server eine fehlende `.json` mit der
SPA-Shell und **HTTP 200**. Ein zurückgehaltener Datensatz sähe damit aus, als
gäbe es ihn noch, nur mit kaputtem JSON.

### 3. Diagramme dürfen die Seite nicht aufschieben

`BarV` setzt eine Mindestbreite aus `Kategorien × 36px + Ränder`. Bei neun
Kategorien sind das 388 px — mehr, als ein 375-px-Display nach Seitenrand übrig
lässt. Ohne Scroll-Container schiebt das die **ganze Seite** auf: Man kann über
den Inhalt hinaus nach rechts wischen und herauszoomen.

Deshalb umschließt `ChartFrame` den Diagrammkörper mit `overflow-x-auto`.
Bildunterschrift und Tabelle bleiben bewusst außerhalb. Wer ein Diagramm
**ohne** `ChartFrame` baut, muss selbst dafür sorgen — das tun derzeit
`Likert5Group`, `Pie`, `Radar`, `Venn2` und `Venn3`, die alle responsiv sind
oder eine feste, kleine Breite haben.

## Öffentlich ist nur eine Auswahl

Auf moosburg.eu läuft eine **Vorschau**. Ein Schritt in `hostinger.yml` kürzt
nach dem Build das Manifest und löscht die zurückgehaltenen Rohdaten aus
`dist/`, damit sie auch nicht über die direkte URL erreichbar sind:

```
Öffentlich:     kommunalwahl_2026, bahnhofumfrage_2023, volksfest_2024, statistik_kommunal_2022
Zurückgehalten: christkindlmarkt_2025, website_innovationen_2025
```

Die Quelldaten im Repo bleiben unangetastet — lokal und auf GitHub Pages sind
weiterhin alle fünf da. Wer die Auswahl ändert, ändert das `keep`-Set im
Workflow. Eine unbekannte ID lässt den Build absichtlich scheitern, statt still
eine Karte verschwinden zu lassen.

Datensatz-ID und Dateiname können auseinanderfallen: `bahnhofumfrage_2023`
liegt in `fahrgastumfrage_2023.json`. Der Filter geht über das Feld `file`.

## Gestaltung

### Verbotenes Muster: der einseitige Kantenakzent

Ein dekorativer Farbbalken entlang **einer** Kante einer Karte oder Box ist in
allen Moosburg-Projekten unerwünscht — er ist die Standardausgabe gängiger
Vorlagen und dekoriert eine Unterscheidung, die die Hierarchie ohnehin trägt.

Die Übersichtskarten hatten genau das: einen `h-1`-Streifen an der Oberkante,
rot für Umfragen, gold für die amtliche Statistik. Ersetzt durch zwei Mittel:

- **Rangfolge:** Das Jahr tritt als Metadatum in `ink-muted` zurück, „Amtliche
  Statistik" behält als Einordnung das Gold.
- **Ganze Fläche:** Die Statistik-Karte trägt einen pergamentfarbenen Grund
  (`bg-gold-100`) samt passendem Rahmen statt eines Balkens.

Nicht gemeint sind Zustandsanzeigen oder strukturelle Linien.

### Kontrast auf getöntem Grund

`ink-muted` (#888888) erreicht auf `gold-100` (#f6ecd5) nur **3,0:1** und
fällt damit unter die WCAG-AA-Grenze. Auf der getönten Karte übernimmt deshalb
`ink-soft` (#555555, 6,4:1), der Kicker steht in `gold-700` (5,6:1).

Wer weitere getönte Flächen einführt, rechnet den Kontrast nach, statt die
Textfarbe von der weißen Karte zu übernehmen.
