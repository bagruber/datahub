// One-shot: applies the revised section texts across all four datasets.
// Merges the website-innovations Detail+Vergleich sections into one.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = (id) => path.join(ROOT, "public/data", `${id}.json`);
const load = (id) => JSON.parse(fs.readFileSync(file(id), "utf8"));
const save = (id, d) => fs.writeFileSync(file(id), JSON.stringify(d));

// ── Christkindlmarkt ───────────────────────────────────────────────────
{
  const d = load("christkindlmarkt_2025");
  const set = (id, text) => {
    const s = d.sections.find((x) => x.id === id);
    if (s) s.text = text;
  };
  set(
    "besuchsverhalten",
    "Der Christkindlmarkt ist für die meisten ein **Wiederholungstermin**: über die Hälfte besucht ihn mehrmals im Jahr. **Samstag** ist mit Abstand der beliebteste Tag, **Freitag** der schwächste. Drei von zehn Besucherinnen und Besuchern kommen an allen drei Markttagen. Beim Tageszeitpunkt überwiegt der **Abend** nach 18 Uhr deutlich. Viele bleiben länger als eine Stunde. Angereist wird vor allem **zu Fuß** (73 %), ÖPNV spielt mit 1 % praktisch keine Rolle.",
  );
  set(
    "bewertung",
    "Sicherheit wird mit 4,9 im Schnitt am besten bewertet. Am unteren Ende landet die Essens-Qualität mit immerhin 3,9. Quer durch alle Kategorien fällt eines auf: **auswärtige Gäste** bewerten konsequent großzügiger als Moosburgerinnen und Moosburger, am deutlichsten bei den Ausstellern (+0,3) und der Atmosphäre (+0,3). Auch das **Alter** spielt eine Rolle. Jüngere unter 30 finden die Musik spürbar schwächer (3,7) als die Generation 70+ (4,4).",
  );
  set(
    "preise",
    "Beide Preisempfindungen liegen **nahe der Mitte**. Knapp jeder Sechste empfindet **Essen oder Getränke** als teuer, etwa gleich viele finden sie eher günstig. Auffällig: Essen und Getränke werden **nahezu identisch** bewertet.",
  );
  set(
    "hindernisse",
    "Wer den Markt eher meidet, nennt am häufigsten ein **unattraktives Angebot** (29 %). Auf Platz zwei und drei stehen **„zu voll“** und **„zu teuer“**, etwa gleichauf bei je rund 17 %. **Schlechte Erreichbarkeit** ist mit 4 % praktisch kein Thema, was zur dominanten Anreise zu Fuß passt.",
  );
  set(
    "standort",
    "Mehrheitlich wird **Der Plan** als bevorzugter Standort gewählt (54 %), klar vor dem **Zehentstadel** (39 %). Mit dem **Alter** verschiebt sich die Präferenz: jüngere und mittlere Jahrgänge stehen klar hinter dem Plan, während die **Generation 70+** eher zum Zehentstadel tendiert.",
  );
  save("christkindlmarkt_2025", d);
  console.log("✓ christkindlmarkt_2025");
}

// ── Bahnhof ────────────────────────────────────────────────────────────
{
  const d = load("fahrgastumfrage_2023");
  const set = (id, text) => {
    const s = d.sections.find((x) => x.id === id);
    if (s) s.text = text;
  };
  set(
    "nutzung",
    "**Zu Fuß** und mit dem **Fahrrad** kommen je rund **45 %** zum Bahnhof, ein nahezu gleichstarkes Duo. Genutzt wird der Bahnhof vor allem an **Werktagen**, gut die Hälfte der Werktagspendler ist allerdings auch am Wochenende dort. Die Stoßzeiten liegen erwartbar im **Berufsverkehr**: morgens 7 bis 9 Uhr und nachmittags 17 bis 19 Uhr. Fast die Hälfte wartet **länger als 10 Minuten**, nur wenige länger als 30 Minuten.",
  );
  set(
    "anforderungen",
    "Drei Wünsche dominieren klar: **Live-Abfahrtsanzeige** (94 % bewerten sie als wichtig oder sehr wichtig), **Toiletten** (89 %) und **Sitzmöglichkeiten** (86 %). Der Bahnhof als kurzer Aufenthaltsort prägt die Erwartungen: alles, was Wartezeit angenehm und planbar macht. Am unteren Ende stehen **Reisebüro** (4,2) und **Wickeltisch** (4,0), die aber selbst dort noch von gut der Hälfte als wichtig eingestuft werden. Kein einziges der 16 Ausstattungsmerkmale fällt unter 4,0. Generell unwichtig erscheint nichts.",
  );
  save("fahrgastumfrage_2023", d);
  console.log("✓ fahrgastumfrage_2023");
}

// ── Website Innovationen — also merge Detail + Vergleich ───────────────
{
  const d = load("website_innovationen_2025");
  const set = (id, text) => {
    const s = d.sections.find((x) => x.id === id);
    if (s) s.text = text;
  };
  set(
    "nutzung",
    "Gut ein Drittel besucht die Website **monatlich**, ähnlich viele **seltener**. Wöchentliche oder tägliche Nutzung ist mit etwa jedem Sechsten die Ausnahme. Die Stadt-Website ist also vor allem ein **Anlassmedium**.",
  );

  // Merge "Innovationen im Vergleich" (radar) into "Innovationen im Detail"
  const detail = d.sections.find((s) => s.id === "innovationen");
  const vergleich = d.sections.find((s) => s.id === "vergleich");
  if (detail && vergleich) {
    detail.title = "Innovationen im Detail & Vergleich";
    detail.charts = [...detail.charts, ...vergleich.charts];
    detail.text =
      "Quer durch alle Dimensionen ist die **Suchfunktion** klarer Liebling: hoher Nutzen, klare Nutzungsabsicht, kaum Bedenken. Auch die **interaktive Karte** schneidet überdurchschnittlich ab. Ein wenig skeptischer sind die Befragten beim **Chatbot** und besonders bei der **Community-Funktion**, wo die Nutzungsabsicht verhalten bleibt. Die höchsten **Bedenken** äußern Befragte beim **Benutzerkonto**.";
    d.sections = d.sections.filter((s) => s !== vergleich);
  }
  save("website_innovationen_2025", d);
  console.log("✓ website_innovationen_2025 (sections merged)");
}

console.log("\nAll datasets updated. Volksfest is rebuilt by build-volksfest.mjs.");
