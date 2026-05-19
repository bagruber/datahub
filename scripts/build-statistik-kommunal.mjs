// Builds public/data/statistik_kommunal_2022.json from numbers hand-extracted
// from the Bayerisches Landesamt für Statistik "Statistik kommunal 2022"
// booklet for Moosburg a. d. Isar (Regionalschlüssel 09 178 143).
//
// Source PDF: rawdata/09178143.pdf
//
// Re-run any time the PDF is updated:  node scripts/build-statistik-kommunal.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/data/statistik_kommunal_2022.json");
const MANIFEST = path.join(ROOT, "public/data/manifest.json");

// Palette refs (kept in sync with src/lib/palette.ts)
const RED = "#c8102e";
const BLUE = "#1f77b4";
const GREEN = "#3f8c52";
const GOLD = "#b8964e";
const PURPLE = "#9b59b6";
const ORANGE = "#d96a4f";

// ── Population since 1840 (Table 1 + 2) ────────────────────────────────
const POPULATION = [
  [1840, 2643],
  [1871, 3459],
  [1900, 3970],
  [1925, 5093],
  [1939, 6169],
  [1950, 10023],
  [1961, 11310],
  [1970, 13050],
  [1987, 14251],
  [2011, 16662],
  [2012, 16971],
  [2013, 17363],
  [2014, 17654],
  [2015, 17847],
  [2016, 18181],
  [2017, 18487],
  [2018, 18510],
  [2019, 18656],
  [2020, 18893],
  [2021, 19309],
];

// ── Age structure 31.12.2021 (Table 3) ─────────────────────────────────
// Ordered bottom-to-top: youngest first. Male = total − female.
const AGE_STRUCTURE_2021 = [
  { label: "Unter 6",  total: 1311, female: 625 },
  { label: "6 – 14",   total: 1664, female: 790 },
  { label: "15 – 17",  total: 544,  female: 282 },
  { label: "18 – 24",  total: 1490, female: 677 },
  { label: "25 – 29",  total: 1225, female: 565 },
  { label: "30 – 39",  total: 2879, female: 1362 },
  { label: "40 – 49",  total: 2473, female: 1226 },
  { label: "50 – 64",  total: 4176, female: 2045 },
  { label: "65 +",     total: 3547, female: 2045 },
].map((g) => ({ label: g.label, left: g.total - g.female, right: g.female }));

// ── Migration since 1960 (Table 4) ─────────────────────────────────────
// Births/deaths and in/out moves. Decadal until 2010, then yearly 2018–2021.
const MIGRATION = [
  { year: 1960, born: 214, died: 114, inFlow: 858,  outFlow: 627 },
  { year: 1970, born: 176, died: 153, inFlow: 916,  outFlow: 727 },
  { year: 1980, born: 152, died: 154, inFlow: 589,  outFlow: 507 },
  { year: 1990, born: 192, died: 168, inFlow: 1089, outFlow: 697 },
  { year: 2000, born: 158, died: 142, inFlow: 956,  outFlow: 895 },
  { year: 2010, born: 134, died: 139, inFlow: 912,  outFlow: 839 },
  { year: 2018, born: 208, died: 191, inFlow: 1319, outFlow: 1308 },
  { year: 2019, born: 165, died: 195, inFlow: 1539, outFlow: 1360 },
  { year: 2020, born: 197, died: 169, inFlow: 1605, outFlow: 1382 },
  { year: 2021, born: 242, died: 210, inFlow: 1720, outFlow: 1335 },
];

// ── SV-Beschäftigte 2016–2021 (Table 6) ────────────────────────────────
// Sectors with missing values in 2016/2017 are dropped from the stacked
// chart by starting it at 2018 (where all sectors sum to total).
const EMPLOYMENT_TOTALS = [
  { year: 2016, arbeitsort: 5312, wohnort: 7906 },
  { year: 2017, arbeitsort: 5572, wohnort: 8131 },
  { year: 2018, arbeitsort: 5619, wohnort: 8303 },
  { year: 2019, arbeitsort: 5680, wohnort: 8452 },
  { year: 2020, arbeitsort: 5723, wohnort: 8531 },
  { year: 2021, arbeitsort: 5922, wohnort: 8647 },
];

const EMPLOYMENT_SECTORS = [
  { year: 2018, landForst: 58, produzierend: 2853, handelVerkehr: 1213, unternehmen: 621, dienstleister: 874 },
  { year: 2019, landForst: 63, produzierend: 2861, handelVerkehr: 1259, unternehmen: 625, dienstleister: 872 },
  { year: 2020, landForst: 59, produzierend: 2859, handelVerkehr: 1327, unternehmen: 578, dienstleister: 900 },
  { year: 2021, landForst: 60, produzierend: 2793, handelVerkehr: 1504, unternehmen: 610, dienstleister: 955 },
];

// ── Arbeitslose 2015–2021 (Table 7) ────────────────────────────────────
const UNEMPLOYMENT = [
  { year: 2015, total: 258, langzeit: 38, schwerbehindert: 24, auslaender: 75,  jung: 31, aelter: 58 },
  { year: 2016, total: 265, langzeit: 49, schwerbehindert: 28, auslaender: 80,  jung: 32, aelter: 64 },
  { year: 2017, total: 259, langzeit: 51, schwerbehindert: 32, auslaender: 81,  jung: 31, aelter: 68 },
  { year: 2018, total: 262, langzeit: 53, schwerbehindert: 32, auslaender: 86,  jung: 28, aelter: 63 },
  { year: 2019, total: 283, langzeit: 53, schwerbehindert: 27, auslaender: 104, jung: 33, aelter: 74 },
  { year: 2020, total: 393, langzeit: 59, schwerbehindert: 34, auslaender: 151, jung: 54, aelter: 92 },
  { year: 2021, total: 396, langzeit: 96, schwerbehindert: 39, auslaender: 154, jung: 44, aelter: 115 },
];

// ── Helpers to shape series for the chart specs ────────────────────────
const popSeries = POPULATION.map(([x, y]) => ({ x, y }));

const mkSeries = (rows, xKey, yKey) =>
  rows.map((r) => ({ x: r[xKey], y: r[yKey] }));

// ── Sections ───────────────────────────────────────────────────────────
const sections = [
  {
    id: "bevoelkerung",
    title: "Bevölkerung wächst",
    order: 1,
    text:
      "Moosburg hat sich seit 1840 **fast versiebenfacht** und zählt Ende 2021 **19.309** Einwohnerinnen und Einwohner. Den größten Sprung gab es nach dem Zweiten Weltkrieg: zwischen 1939 und 1950 wuchs die Stadt um über die Hälfte. Auch das vergangene Jahrzehnt verlief dynamisch, plus 16 % seit dem Zensus 2011.",
    charts: [
      {
        id: "einwohner_seit_1840",
        type: "line_series",
        title: "Einwohnerzahl seit 1840",
        xLabel: "Jahr",
        yLabel: "Einwohner",
        markers: true,
        series: [
          { label: "Einwohner", color: RED, data: popSeries },
        ],
      },
    ],
  },
  {
    id: "altersstruktur",
    title: "Altersstruktur",
    order: 2,
    text:
      "Mit einem Durchschnittsalter von **42,3 Jahren** ist Moosburg eine vergleichsweise junge bayerische Stadt. Die zahlenmäßig größte Gruppe sind die **50- bis 64-Jährigen** mit über 4.000 Menschen. Die klassische Bevölkerungspyramide hat sich längst zur Glocke geformt: oben breit, unten schmal.",
    charts: [
      {
        id: "alterspyramide_2021",
        type: "pyramid",
        title: "Bevölkerung nach Altersgruppen, 31.12.2021",
        leftLabel: "männlich",
        rightLabel: "weiblich",
        leftColor: BLUE,
        rightColor: RED,
        groups: AGE_STRUCTURE_2021,
      },
    ],
  },
  {
    id: "wanderung",
    title: "Wer kommt, wer geht",
    order: 3,
    text:
      "Moosburg wächst vor allem durch **Zuzug**. 2021 zogen 1.720 Menschen zu, 1.335 weg, ein **Plus von 385** allein durch Wanderung. **Geburten und Sterbefälle** halten sich dagegen etwa die Waage. Das natürliche Saldo lag 2021 bei nur 32.",
    charts: [
      {
        id: "wanderungen",
        type: "line_series",
        title: "Zugezogene und Fortgezogene seit 1960",
        xLabel: "Jahr",
        yLabel: "Personen",
        markers: true,
        series: [
          { label: "Zugezogene",  color: GREEN, data: mkSeries(MIGRATION, "year", "inFlow") },
          { label: "Fortgezogene", color: RED,   data: mkSeries(MIGRATION, "year", "outFlow") },
        ],
      },
      {
        id: "natuerliche_bewegung",
        type: "line_series",
        title: "Lebendgeborene und Gestorbene seit 1960",
        xLabel: "Jahr",
        yLabel: "Personen",
        markers: true,
        series: [
          { label: "Lebendgeborene", color: GREEN, data: mkSeries(MIGRATION, "year", "born") },
          { label: "Gestorbene",     color: RED,   data: mkSeries(MIGRATION, "year", "died") },
        ],
      },
    ],
  },
  {
    id: "arbeitnehmer",
    title: "Arbeitnehmer",
    order: 4,
    text:
      "Moosburg hat 2021 **8.647 sozialversicherungspflichtig Beschäftigte am Wohnort**, aber nur 5.922 mit Arbeitsplatz vor Ort. Wer hier wohnt, **pendelt häufig zur Arbeit nach außerhalb**. Beim Branchen-Mix vor Ort dominiert das **Produzierende Gewerbe** mit knapp der Hälfte aller lokalen Stellen, während **Handel, Verkehr und Gastgewerbe** den deutlichsten Zuwachs verzeichnen.",
    charts: [
      {
        id: "beschaeftigte_total",
        type: "line_series",
        title: "Sozialversicherungspflichtig Beschäftigte: Wohnort vs. Arbeitsort",
        xLabel: "Jahr",
        yLabel: "Personen",
        markers: true,
        series: [
          { label: "am Wohnort",   color: BLUE, data: mkSeries(EMPLOYMENT_TOTALS, "year", "wohnort") },
          { label: "am Arbeitsort", color: RED,  data: mkSeries(EMPLOYMENT_TOTALS, "year", "arbeitsort") },
        ],
      },
      {
        id: "beschaeftigte_branchen",
        type: "stacked_column",
        title: "Beschäftigte am Arbeitsort nach Branche, 2018 – 2021",
        xLabel: "Jahr",
        yLabel: "Personen",
        series: [
          { label: "Produzierendes Gewerbe", color: BLUE,   data: mkSeries(EMPLOYMENT_SECTORS, "year", "produzierend") },
          { label: "Handel, Verkehr, Gast",  color: ORANGE, data: mkSeries(EMPLOYMENT_SECTORS, "year", "handelVerkehr") },
          { label: "Öffentliche & priv. Dienstleister", color: GREEN, data: mkSeries(EMPLOYMENT_SECTORS, "year", "dienstleister") },
          { label: "Unternehmensdienstleister", color: PURPLE, data: mkSeries(EMPLOYMENT_SECTORS, "year", "unternehmen") },
          { label: "Land- & Forstwirtschaft", color: GOLD,   data: mkSeries(EMPLOYMENT_SECTORS, "year", "landForst") },
        ],
      },
    ],
  },
  {
    id: "arbeitslose",
    title: "Arbeitslose",
    order: 5,
    text:
      "Die Arbeitslosenzahlen sind seit 2015 deutlich gestiegen, von 258 auf 396, fast die Hälfte mehr. Den stärksten Anstieg gab es im **Corona-Jahr 2020**, danach blieb das Niveau auf einem höheren Plateau. Auffällig: die Zahl arbeitsloser **Ausländerinnen und Ausländer** hat sich seit 2015 mehr als verdoppelt, ebenso die **Langzeitarbeitslosigkeit**, die seit 2019 deutlich zugenommen hat.",
    charts: [
      {
        id: "arbeitslose_gruppen",
        type: "line_series",
        title: "Arbeitslose nach Personengruppe, seit 2015",
        xLabel: "Jahr",
        yLabel: "Personen",
        markers: true,
        series: [
          { label: "Ausländer",          color: BLUE,   data: mkSeries(UNEMPLOYMENT, "year", "auslaender") },
          { label: "55- bis 65-Jährige", color: ORANGE, data: mkSeries(UNEMPLOYMENT, "year", "aelter") },
          { label: "Langzeitarbeitslose", color: RED,   data: mkSeries(UNEMPLOYMENT, "year", "langzeit") },
          { label: "15- bis 25-Jährige", color: PURPLE, data: mkSeries(UNEMPLOYMENT, "year", "jung") },
          { label: "Schwerbehinderte",   color: GOLD,   data: mkSeries(UNEMPLOYMENT, "year", "schwerbehindert") },
        ],
      },
    ],
  },
];

// Number of data points across all charts (used for the home-card stat).
let dataPoints = 0;
for (const s of sections) for (const c of s.charts) {
  if (c.type === "pyramid") dataPoints += c.groups.length * 2;
  else for (const ser of c.series) dataPoints += ser.data.length;
}

const out = {
  meta: {
    id: "statistik_kommunal_2022",
    title: "Bevölkerungsstatistik",
    year: 2022,
    n: dataPoints,
    source: "Bayer. Landesamt für Statistik",
    description:
      "Bevölkerungs- und Arbeitsmarktdaten der Stadt Moosburg a. d. Isar aus der Reihe 'Statistik kommunal 2022' des Bayerischen Landesamts für Statistik. Eine Auswahl aus 33 Tabellen, fokussiert auf Menschen und Arbeit.",
  },
  kind: "statistik",
  codebook: {},
  filters: [],
  sections,
  records: [],
};

fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`Wrote ${OUT} (${sections.length} sections, ${dataPoints} data points)`);

// Update manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const existing = manifest.datasets.find((d) => d.id === "statistik_kommunal_2022");
const entry = {
  id: "statistik_kommunal_2022",
  file: "statistik_kommunal_2022.json",
  title: "Statistik kommunal",
  year: 2022,
  n: dataPoints,
  kind: "statistik",
};
if (existing) Object.assign(existing, entry);
else manifest.datasets.push(entry);
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Manifest: statistik_kommunal_2022 ${existing ? "updated" : "added"}`);
