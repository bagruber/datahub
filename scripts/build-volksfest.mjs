// Convert rawdata/volksfestroh.csv → public/data/volksfest_2024.json
//
// One-shot script. Run with `node scripts/build-volksfest.mjs`. Re-run any
// time the CSV changes. Free-text fields are preserved as raw strings on
// each record so we don't lose information; we just don't render them yet.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CSV_PATH = path.join(ROOT, "rawdata", "volksfestroh.csv");
const OUT_PATH = path.join(ROOT, "public", "data", "volksfest_2024.json");
const MANIFEST_PATH = path.join(ROOT, "public", "data", "manifest.json");

// ── CSV parser (RFC 4180-ish) ────────────────────────────────────────────
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\r") { /* skip */ }
      else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += ch;
    }
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

// ── Codebooks ────────────────────────────────────────────────────────────
const cb = {
  age: { 0: "Unter 18", 1: "18-30", 2: "31-50", 3: "51-70", 4: "70+" },
  wohnort: { 1: "Moosburg", 2: "Auswärtig" },
  tage: {
    1: "Montag", 2: "Dienstag", 3: "Mittwoch", 4: "Donnerstag",
    5: "Freitag", 6: "Samstag", 7: "Sonntag",
  },
  tageszeit: { 1: "Vor 14 Uhr", 2: "14 bis 18 Uhr", 3: "Nach 18 Uhr" },
  anreise: {
    1: "zu Fuß", 2: "Fahrrad", 3: "PKW", 4: "Bus", 5: "Zug", 6: "Motorrad",
  },
  nutzung_ort: { 1: "Im Festzelt", 2: "Von den Ständen" },
  ernaehrung: {
    1: "vegetarisch",
    2: "vegan",
    3: "laktosefrei",
    4: "glutenfrei",
    5: "halal/koscher",
    6: "keine zusätzlichen Angebote notwendig",
  },
  likert6: { 1: "1 (sehr schlecht)", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6 (sehr gut)" },
  likert5: { 1: "1 (sehr schlecht)", 2: "2", 3: "3 (neutral)", 4: "4", 5: "5 (sehr gut)" },
};

// ── Reverse-lookup helpers ──────────────────────────────────────────────
const REV = (m) => {
  const r = new Map();
  for (const [k, v] of Object.entries(m)) r.set(v.toLowerCase(), Number(k));
  return r;
};
const REV_TAGE = REV(cb.tage);
const REV_TAGESZEIT = REV(cb.tageszeit);
const REV_NUTZUNG = REV(cb.nutzung_ort);

// Anreise alternates: original uses "zu Fuß" (capital z?) — accept lowercase too.
const REV_ANREISE = new Map([
  ["zu fuß", 1], ["fahrrad", 2], ["pkw", 3], ["bus", 4], ["zug", 5], ["motorrad", 6],
]);

const REV_ERNAEHRUNG = new Map([
  ["vegetarisch", 1],
  ["vegan", 2],
  ["laktosefrei", 3],
  ["glutenfrei", 4],
  ["halal/koscher", 5],
  ["keine zusätzlichen angebote notwendig", 6],
]);

// ── Field helpers ───────────────────────────────────────────────────────
const trim = (s) => (s || "").trim();
const num = (s) => {
  const t = trim(s);
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const ageBin = (age) => {
  if (age == null) return null;
  if (age < 18) return 0;
  if (age <= 30) return 1;
  if (age <= 50) return 2;
  if (age <= 70) return 3;
  return 4;
};
const splitMulti = (s) => trim(s).split(",").map((x) => x.trim()).filter(Boolean);
const mapMulti = (s, lookup) => {
  const out = [];
  for (const item of splitMulti(s)) {
    const code = lookup.get(item.toLowerCase());
    if (code != null) out.push(code);
  }
  return out.sort((a, b) => a - b);
};
const yesNo = (s) => {
  const t = trim(s).toLowerCase();
  if (t === "ja") return 1;
  if (t === "nein") return 2;
  return null;
};
const likertOrNull = (s, max) => {
  const n = num(s);
  if (n == null) return null;
  if (n < 1 || n > max) return null;
  return Math.round(n);
};

// ── Main ───────────────────────────────────────────────────────────────
const csv = fs.readFileSync(CSV_PATH, "utf8");
const rows = parseCSV(csv);
const header = rows[0];
const data = rows.slice(1).filter((r) => r.some((c) => c && c.trim()));

const records = data.map((r) => {
  const ageRaw = num(r[3]);
  return {
    // metadata
    datum: trim(r[0]) || null,
    uhrzeit: trim(r[1]) || null,

    // demographics
    alter_raw: ageRaw,
    age: ageBin(ageRaw),
    wohnort: yesNo(r[4]),

    // visit
    tage: mapMulti(r[5], REV_TAGE),
    tageszeit: mapMulti(r[6], REV_TAGESZEIT),

    // erreichbarkeit
    anreise: mapMulti(r[8], REV_ANREISE),
    erreichbarkeit: likertOrNull(r[9], 6),
    erreichbarkeit_kommentar: trim(r[10]) || null,

    // essen
    essen_nutzung: mapMulti(r[12], REV_NUTZUNG),
    ernaehrung: mapMulti(r[13], REV_ERNAEHRUNG),
    essen_schwierigkeit: likertOrNull(r[14], 6),
    preise_essen: likertOrNull(r[15], 5),
    angebot_essen: likertOrNull(r[16], 6),

    // getränke
    getraenke_nutzung: mapMulti(r[18], REV_NUTZUNG),
    preise_getraenke: likertOrNull(r[19], 5),
    angebot_getraenke: likertOrNull(r[20], 6),

    // programm
    programm: likertOrNull(r[22], 6),
    fahrgeschaefte: likertOrNull(r[23], 6),
    rahmenprogramm: trim(r[24]) || null,

    // sicherheit
    sicherheit: likertOrNull(r[25], 6),
    sicherheit_kommentar: trim(r[26]) || null,

    // sonstiges
    sonstiges: trim(r[27]) || null,
  };
});

// ── Filters ────────────────────────────────────────────────────────────
const filters = [
  {
    key: "age",
    source: "age",
    type: "histogram",
    label: "Alter",
    labels: Object.values(cb.age),
    categories: Object.keys(cb.age).map(Number),
  },
  {
    key: "wohnort",
    source: "wohnort",
    type: "toggle",
    label: "Wohnort",
    labels: Object.values(cb.wohnort),
    categories: Object.keys(cb.wohnort).map(Number),
  },
];

// ── Sections / charts ──────────────────────────────────────────────────
const sections = [
  {
    id: "besuch",
    title: "Besuchsverhalten",
    order: 1,
    text: "Wann und an welchen Tagen wird das Volksfest besucht?",
    charts: [
      {
        id: "tage",
        type: "bar_h",
        title: "Besuchstage",
        source: "tage",
        color: "#c8102e",
        preserveOrder: true,
        items: Object.entries(cb.tage).map(([k, label]) => ({
          label,
          vals: [Number(k)],
        })),
      },
      {
        id: "tageszeit",
        type: "venn3",
        title: "Tageszeiten",
        source: "tageszeit",
        values: [1, 2, 3],
        labels: Object.values(cb.tageszeit),
        colors: ["#e2a900", "#1f77b4", "#c8102e"],
      },
    ],
  },
  {
    id: "erreichbarkeit",
    title: "Erreichbarkeit",
    order: 2,
    text: "Wie kommen Besucher zum Festplatz, und wie wird die Erreichbarkeit bewertet?",
    charts: [
      {
        id: "anreise",
        type: "bar_h",
        title: "Verkehrsmittel",
        source: "anreise",
        color: "#1f77b4",
      },
      {
        id: "erreichbarkeit_likert",
        type: "likert6",
        title: "Bewertung Erreichbarkeit",
        items: [
          { source: "erreichbarkeit", label: "Erreichbarkeit insgesamt" },
        ],
      },
    ],
  },
  {
    id: "essen",
    title: "Essen",
    order: 3,
    text: "Wo wird gegessen, welche Ernährungspräferenzen werden gewünscht, und wie wird das Angebot bewertet?",
    charts: [
      {
        id: "essen_nutzung",
        type: "venn2",
        title: "Wo Essen gekauft wird",
        source: "essen_nutzung",
        values: [1, 2],
        labels: Object.values(cb.nutzung_ort),
        colors: ["#c8102e", "#1f77b4"],
      },
      {
        id: "ernaehrung",
        type: "bar_h",
        title: "Gewünschte Ernährungspräferenzen",
        source: "ernaehrung",
        color: "#9b59b6",
      },
      {
        id: "essen_likert6",
        type: "likert6",
        title: "Bewertung — Auffindbarkeit & Angebot",
        items: [
          { source: "essen_schwierigkeit", label: "Essen finden" },
          { source: "angebot_essen", label: "Angebot Essen" },
        ],
      },
      {
        id: "essen_preise",
        type: "likert5",
        title: "Bewertung Preise Essen",
        items: [{ source: "preise_essen", label: "Preise Essen" }],
      },
    ],
  },
  {
    id: "getraenke",
    title: "Getränke",
    order: 4,
    text: "Wo wird getrunken, und wie wird das Angebot bewertet?",
    charts: [
      {
        id: "getraenke_nutzung",
        type: "venn2",
        title: "Wo Getränke gekauft werden",
        source: "getraenke_nutzung",
        values: [1, 2],
        labels: Object.values(cb.nutzung_ort),
        colors: ["#c8102e", "#1f77b4"],
      },
      {
        id: "getraenke_likert6",
        type: "likert6",
        title: "Bewertung Angebot Getränke",
        items: [{ source: "angebot_getraenke", label: "Angebot Getränke" }],
      },
      {
        id: "getraenke_preise",
        type: "likert5",
        title: "Bewertung Preise Getränke",
        items: [{ source: "preise_getraenke", label: "Preise Getränke" }],
      },
    ],
  },
  {
    id: "programm",
    title: "Programm & Fahrgeschäfte",
    order: 5,
    text: "Wie wird das Unterhaltungsangebot bewertet?",
    charts: [
      {
        id: "programm_likert6",
        type: "likert6",
        title: "Bewertung Programm & Fahrgeschäfte",
        items: [
          { source: "programm", label: "Programm (Musik etc.)" },
          { source: "fahrgeschaefte", label: "Fahrgeschäfte & Stände" },
        ],
      },
    ],
  },
  {
    id: "sicherheit",
    title: "Sicherheit",
    order: 6,
    text: "Wie sicher fühlen sich Besucher auf den Moosburger Volksfesten?",
    charts: [
      {
        id: "sicherheit_likert6",
        type: "likert6",
        title: "Sicherheitsempfinden",
        items: [{ source: "sicherheit", label: "Sicherheit insgesamt" }],
      },
    ],
  },
  {
    id: "zusammenhaenge",
    title: "Zusammenhänge der Bewertungen",
    order: 7,
    text: "Welche Bewertungen hängen zusammen? Werte nahe +1 bedeuten gleichgerichtete Bewertungen, Werte nahe 0 keinen Zusammenhang.",
    charts: [
      {
        id: "corr",
        type: "correlation",
        title: "Korrelationen aller Bewertungen",
        sources: [
          { source: "erreichbarkeit", label: "Erreichbarkeit" },
          { source: "essen_schwierigkeit", label: "Essen finden" },
          { source: "preise_essen", label: "Preise Essen" },
          { source: "angebot_essen", label: "Angebot Essen" },
          { source: "preise_getraenke", label: "Preise Getränke" },
          { source: "angebot_getraenke", label: "Angebot Getränke" },
          { source: "programm", label: "Programm" },
          { source: "fahrgeschaefte", label: "Fahrgeschäfte" },
          { source: "sicherheit", label: "Sicherheit" },
        ],
      },
    ],
  },
];

const out = {
  meta: {
    id: "volksfest_2024",
    title: "Volksfest",
    year: 2024,
    n: records.length,
    description:
      "Besucherbefragung zum Moosburger Volksfest und zur Herbstschau (Oktober 2024).",
  },
  codebook: cb,
  filters,
  sections,
  records,
};

// Reuse `header` for a sanity-check log
console.log(`CSV columns: ${header.length}, rows: ${data.length}`);
fs.writeFileSync(OUT_PATH, JSON.stringify(out));
console.log(`Wrote ${OUT_PATH} (${out.records.length} records, ${out.sections.length} sections)`);

// Update manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const existing = manifest.datasets.find((d) => d.id === "volksfest_2024");
const entry = {
  id: "volksfest_2024",
  file: "volksfest_2024.json",
  title: "Volksfest",
  year: 2024,
  n: out.records.length,
};
if (existing) Object.assign(existing, entry);
else manifest.datasets.push(entry);
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Manifest: volksfest_2024 ${existing ? "updated" : "added"}`);
