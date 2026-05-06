// Throwaway stats script: prints aggregate numbers for each dataset section
// so we can write data-driven section texts. Not part of the build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const load = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "public/data", `${id}.json`), "utf8"));

function mean(records, field, predicate) {
  let s = 0, n = 0;
  for (const r of records) {
    if (typeof r[field] === "number" && (!predicate || predicate(r))) { s += r[field]; n++; }
  }
  return { mean: n ? s / n : NaN, n };
}
function shareTop(records, field, threshold, predicate) {
  let h = 0, n = 0;
  for (const r of records) {
    if (typeof r[field] === "number" && (!predicate || predicate(r))) {
      n++; if (r[field] >= threshold) h++;
    }
  }
  return { share: n ? h / n : 0, n };
}
function shareCode(records, field, code, isArrayField) {
  let h = 0, n = 0;
  for (const r of records) {
    const v = r[field];
    const ok = isArrayField ? Array.isArray(v) && v.length > 0 : v != null;
    if (!ok) continue;
    n++;
    const list = Array.isArray(v) ? v : [v];
    if (list.includes(code)) h++;
  }
  return { share: n ? h / n : 0, n, count: h };
}
const pct = (x) => `${(x * 100).toFixed(0)}%`;

// ── Christkindlmarkt ───────────────────────────────────────────────────
console.log("\n========== CHRISTKINDLMARKT ==========\n");
const ck = load("christkindlmarkt_2025");
console.log(`n = ${ck.records.length}, Moosburg=${ck.records.filter(r=>r.moos===1).length}, Auswärtig=${ck.records.filter(r=>r.moos===2).length}`);

console.log("\n--- besuchsverhalten ---");
// Besuchshäufigkeit (1+2 = seltener/nie, 3 = einmal/jahr, 4 = mehrmals/jahr)
const freqMehr = ck.records.filter(r => r.frequency === 4).length;
const freqEin = ck.records.filter(r => r.frequency === 3).length;
const freqSel = ck.records.filter(r => r.frequency === 1 || r.frequency === 2).length;
const freqN = freqMehr + freqEin + freqSel;
console.log(`Mehrmals: ${freqMehr} (${pct(freqMehr/freqN)}), Einmal: ${freqEin} (${pct(freqEin/freqN)}), Seltener/Nie: ${freqSel} (${pct(freqSel/freqN)})`);
// Tage (codebook 1=Fr, 2=Sa, 4=So)
const dayCounts = { Fr: 0, Sa: 0, So: 0, all3: 0, FrOnly: 0, SaOnly: 0, SoOnly: 0 };
for (const r of ck.records) {
  if (!Array.isArray(r.days) || !r.days.length) continue;
  if (r.days.includes(1)) dayCounts.Fr++;
  if (r.days.includes(2)) dayCounts.Sa++;
  if (r.days.includes(4)) dayCounts.So++;
  if (r.days.length === 3) dayCounts.all3++;
  if (r.days.length === 1 && r.days[0] === 1) dayCounts.FrOnly++;
  if (r.days.length === 1 && r.days[0] === 2) dayCounts.SaOnly++;
  if (r.days.length === 1 && r.days[0] === 4) dayCounts.SoOnly++;
}
console.log(`Tage – Fr ${dayCounts.Fr} / Sa ${dayCounts.Sa} / So ${dayCounts.So}, alle drei ${dayCounts.all3}, nur So ${dayCounts.SoOnly}, nur Fr ${dayCounts.FrOnly}, nur Sa ${dayCounts.SaOnly}`);
// Tageszeiten (1=Nachmittags, 2=Abends)
const tNach = ck.records.filter(r => Array.isArray(r.times) && r.times.includes(1)).length;
const tAbnd = ck.records.filter(r => Array.isArray(r.times) && r.times.includes(2)).length;
const tBoth = ck.records.filter(r => Array.isArray(r.times) && r.times.includes(1) && r.times.includes(2)).length;
console.log(`Tageszeiten – Nachmittags ${tNach}, Abends ${tAbnd}, beide ${tBoth}`);
// Aufenthalt (codebook duration: 1=<1h, 2=1-2h, 3=>2h)
console.log(`codebook.duration:`, ck.codebook.duration);
const dur1 = ck.records.filter(r => Array.isArray(r.duration) && r.duration.includes(1)).length;
const dur2 = ck.records.filter(r => Array.isArray(r.duration) && r.duration.includes(2)).length;
const dur3 = ck.records.filter(r => Array.isArray(r.duration) && r.duration.includes(3)).length;
console.log(`Aufenthalt – dur1 ${dur1}, dur2 ${dur2}, dur3 ${dur3}`);
// Anreise
console.log("codebook.transport:", ck.codebook.transport);
for (const [k,v] of Object.entries(ck.codebook.transport)) {
  const c = ck.records.filter(r => Array.isArray(r.transport) && r.transport.includes(Number(k))).length;
  console.log(`  ${v}: ${c} (${pct(c/ck.records.length)})`);
}

console.log("\n--- preise ---");
console.log(`Preise Essen (1=günstig…6=teuer): mean ${mean(ck.records,'preise_essen').mean.toFixed(2)}, share>=5 (teuer): ${pct(shareTop(ck.records,'preise_essen',5).share)}, share<=2 (günstig): ${pct((ck.records.filter(r=>r.preise_essen<=2).length)/ck.records.filter(r=>typeof r.preise_essen==='number').length)}`);
console.log(`Preise Getränke: mean ${mean(ck.records,'preise_getraenke').mean.toFixed(2)}, share>=5: ${pct(shareTop(ck.records,'preise_getraenke',5).share)}`);

console.log("\n--- hindernisse ---");
console.log("codebook.barriers:", ck.codebook.barriers);
for (const [k,v] of Object.entries(ck.codebook.barriers || {})) {
  const c = ck.records.filter(r => Array.isArray(r.barriers) && r.barriers.includes(Number(k))).length;
  if (c > 0) console.log(`  ${v}: ${c} (${pct(c/ck.records.length)})`);
}

console.log("\n--- standort ---");
console.log("codebook.standort:", ck.codebook.standort);
const stPlan = ck.records.filter(r => r.standort === 1).length;
const stZehn = ck.records.filter(r => r.standort === 2).length;
const stBoth = ck.records.filter(r => r.standort === 3).length;
const stN = stPlan + stZehn + stBoth;
console.log(`Plan ${stPlan} (${pct(stPlan/stN)}), Zehentstadel ${stZehn} (${pct(stZehn/stN)}), Beide/k.M. ${stBoth} (${pct(stBoth/stN)})`);
// Standort by Wohnort
const stPlanMoos = ck.records.filter(r=>r.standort===1 && r.moos===1).length;
const stPlanAus  = ck.records.filter(r=>r.standort===1 && r.moos===2).length;
const stZehnMoos = ck.records.filter(r=>r.standort===2 && r.moos===1).length;
const stZehnAus  = ck.records.filter(r=>r.standort===2 && r.moos===2).length;
const moosN = ck.records.filter(r=>r.moos===1 && r.standort).length;
const ausN  = ck.records.filter(r=>r.moos===2 && r.standort).length;
console.log(`Moosburger: Plan ${pct(stPlanMoos/moosN)}, Zehentstadel ${pct(stZehnMoos/moosN)}`);
console.log(`Auswärtige: Plan ${pct(stPlanAus/ausN)}, Zehentstadel ${pct(stZehnAus/ausN)}`);

// ── Bahnhof ────────────────────────────────────────────────────────────
console.log("\n========== BAHNHOF ==========\n");
const bn = load("fahrgastumfrage_2023");
console.log(`n = ${bn.records.length}`);
console.log("\n--- nutzung ---");
console.log("codebook.transport:", bn.codebook.transport);
for (const [k,v] of Object.entries(bn.codebook.transport)) {
  const c = bn.records.filter(r => Array.isArray(r.transport) && r.transport.includes(Number(k))).length;
  console.log(`  ${v}: ${c} (${pct(c/bn.records.length)})`);
}
const dWerk = bn.records.filter(r => Array.isArray(r.days) && r.days.includes(1)).length;
const dEnde = bn.records.filter(r => Array.isArray(r.days) && r.days.includes(2)).length;
const dBoth = bn.records.filter(r => Array.isArray(r.days) && r.days.includes(1) && r.days.includes(2)).length;
console.log(`Tage – Werktage ${dWerk}, Wochenende ${dEnde}, beide ${dBoth}`);
// Uhrzeit slot counts (object keys)
const slotCounts = {};
for (const r of bn.records) {
  if (r.times && typeof r.times === "object" && !Array.isArray(r.times)) {
    for (const k of Object.keys(r.times)) slotCounts[k] = (slotCounts[k]||0)+1;
  }
}
console.log(`Uhrzeit slots:`, slotCounts);
// Wartezeit
const waitOut1 = bn.records.filter(r => r.wait_out === 1).length;
const waitOut2 = bn.records.filter(r => r.wait_out === 2).length;
const waitOut3 = bn.records.filter(r => r.wait_out === 3).length;
const waitOutN = waitOut1+waitOut2+waitOut3;
console.log(`Wartezeit Hinfahrt – <10min ${pct(waitOut1/waitOutN)}, 10-30 ${pct(waitOut2/waitOutN)}, >30 ${pct(waitOut3/waitOutN)}`);
const waitRet1 = bn.records.filter(r => r.wait_ret === 1).length;
const waitRet2 = bn.records.filter(r => r.wait_ret === 2).length;
const waitRet3 = bn.records.filter(r => r.wait_ret === 3).length;
const waitRetN = waitRet1+waitRet2+waitRet3;
console.log(`Wartezeit Rückfahrt – <10min ${pct(waitRet1/waitRetN)}, 10-30 ${pct(waitRet2/waitRetN)}, >30 ${pct(waitRet3/waitRetN)}`);

// ── Volksfest ──────────────────────────────────────────────────────────
console.log("\n========== VOLKSFEST ==========\n");
const vf = load("volksfest_2024");
console.log(`n = ${vf.records.length}`);

console.log("\n--- besuch ---");
// Tage Mo-So
for (const [k,label] of Object.entries(vf.codebook.tage)) {
  const c = vf.records.filter(r => Array.isArray(r.tage) && r.tage.includes(Number(k))).length;
  console.log(`  ${label}: ${c} (${pct(c/vf.records.length)})`);
}
// Tageszeit (3 sets)
for (const [k,label] of Object.entries(vf.codebook.tageszeit)) {
  const c = vf.records.filter(r => Array.isArray(r.tageszeit) && r.tageszeit.includes(Number(k))).length;
  console.log(`  ${label}: ${c} (${pct(c/vf.records.length)})`);
}
// Triple intersection?
const tAll = vf.records.filter(r => Array.isArray(r.tageszeit) && r.tageszeit.includes(1) && r.tageszeit.includes(2) && r.tageszeit.includes(3)).length;
console.log(`Alle drei Tageszeiten: ${tAll}`);

console.log("\n--- erreichbarkeit ---");
for (const [k,label] of Object.entries(vf.codebook.anreise)) {
  const c = vf.records.filter(r => Array.isArray(r.anreise) && r.anreise.includes(Number(k))).length;
  if (c>0) console.log(`  ${label}: ${c} (${pct(c/vf.records.length)})`);
}
console.log(`Erreichbarkeit (likert6 mean): ${mean(vf.records,'erreichbarkeit').mean.toFixed(2)}, share>=5: ${pct(shareTop(vf.records,'erreichbarkeit',5).share)}`);

console.log("\n--- essen ---");
const en1 = vf.records.filter(r => Array.isArray(r.essen_nutzung) && r.essen_nutzung.includes(1)).length;
const en2 = vf.records.filter(r => Array.isArray(r.essen_nutzung) && r.essen_nutzung.includes(2)).length;
const enBoth = vf.records.filter(r => Array.isArray(r.essen_nutzung) && r.essen_nutzung.includes(1) && r.essen_nutzung.includes(2)).length;
console.log(`Essen – Festzelt ${en1}, Stände ${en2}, beide ${enBoth}`);
for (const [k,label] of Object.entries(vf.codebook.ernaehrung)) {
  const c = vf.records.filter(r => Array.isArray(r.ernaehrung) && r.ernaehrung.includes(Number(k))).length;
  if (c>0) console.log(`  ${label}: ${c} (${pct(c/vf.records.length)})`);
}
console.log(`Essen finden (mean): ${mean(vf.records,'essen_schwierigkeit').mean.toFixed(2)}`);
console.log(`Angebot Essen (mean): ${mean(vf.records,'angebot_essen').mean.toFixed(2)}`);

console.log("\n--- getraenke ---");
const gn1 = vf.records.filter(r => Array.isArray(r.getraenke_nutzung) && r.getraenke_nutzung.includes(1)).length;
const gn2 = vf.records.filter(r => Array.isArray(r.getraenke_nutzung) && r.getraenke_nutzung.includes(2)).length;
const gnBoth = vf.records.filter(r => Array.isArray(r.getraenke_nutzung) && r.getraenke_nutzung.includes(1) && r.getraenke_nutzung.includes(2)).length;
console.log(`Getränke – Festzelt ${gn1}, Stände ${gn2}, beide ${gnBoth}`);
console.log(`Angebot Getränke (mean): ${mean(vf.records,'angebot_getraenke').mean.toFixed(2)}`);

console.log("\n--- preise ---");
console.log(`Preise Essen (1=günstig…5=teuer): mean ${mean(vf.records,'preise_essen').mean.toFixed(2)}, share>=4 (teuer): ${pct(shareTop(vf.records,'preise_essen',4).share)}`);
console.log(`Preise Getränke: mean ${mean(vf.records,'preise_getraenke').mean.toFixed(2)}, share>=4: ${pct(shareTop(vf.records,'preise_getraenke',4).share)}`);

console.log("\n--- programm ---");
console.log(`Programm: mean ${mean(vf.records,'programm').mean.toFixed(2)}, share>=5: ${pct(shareTop(vf.records,'programm',5).share)}`);
console.log(`Fahrgeschäfte: mean ${mean(vf.records,'fahrgeschaefte').mean.toFixed(2)}, share>=5: ${pct(shareTop(vf.records,'fahrgeschaefte',5).share)}`);

console.log("\n--- sicherheit ---");
console.log(`Sicherheit: mean ${mean(vf.records,'sicherheit').mean.toFixed(2)}, share>=5: ${pct(shareTop(vf.records,'sicherheit',5).share)}`);

// ── Website Innovationen ─────────────────────────────────────────────
console.log("\n========== WEBSITE INNOVATIONEN ==========\n");
const wi = load("website_innovationen_2025");
console.log(`n = ${wi.records.length}`);
console.log("\n--- nutzung ---");
const moos = wi.records.filter(r => r.wohnort === 1).length;
const aus  = wi.records.filter(r => r.wohnort === 2).length;
console.log(`Wohnort: Moosburg ${moos} (${pct(moos/(moos+aus))}), Auswärtig ${aus}`);
// Frequenz
for (const [k,label] of Object.entries(wi.codebook.frequency)) {
  const c = wi.records.filter(r => r.frequency === Number(k)).length;
  console.log(`  Frequenz ${label}: ${c}`);
}

console.log("\n--- innovationen detail ---");
// Mean across each innovation × dimension
const innovs = ['account','chatbot','karte','suche','community'];
const innovNames = {account:'Benutzerkonto', chatbot:'Chatbot', karte:'Interaktive Karte', suche:'Suche', community:'Community'};
const dims = ['verstaendnis','nuetzlichkeit','nutzungsabsicht','bedenken','sinnhaftigkeit'];
for (const inn of innovs) {
  const m = dims.map(d => mean(wi.records, `${inn}_${d}`).mean);
  // Inverted dim 3 (bedenken)
  const adjusted = m.map((v, i) => i===3 ? 6-v : v);
  const overall = adjusted.reduce((a,b)=>a+b,0)/adjusted.length;
  console.log(`${innovNames[inn].padEnd(20)} adjusted overall: ${overall.toFixed(2)} | dims: V=${m[0].toFixed(2)} N=${m[1].toFixed(2)} A=${m[2].toFixed(2)} B=${m[3].toFixed(2)} S=${m[4].toFixed(2)}`);
}
