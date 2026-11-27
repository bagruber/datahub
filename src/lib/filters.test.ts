import { describe, expect, it } from "vitest";
import type { FilterSpec } from "./data";
import {
  MIN_N,
  applyFilters,
  ohneAngabeIndex,
  readSelections,
  toggleOption,
  waehlbar,
  writeSelections,
} from "./filters";

const ALTER: FilterSpec = {
  key: "age",
  source: "age",
  type: "histogram",
  label: "Alter",
  labels: ["Bis 30", "31-50", "Über 50"],
  categories: [[0, 1], 2, [3, 4]],
};
const ORT: FilterSpec = {
  key: "ort",
  source: "ort",
  type: "toggle",
  label: "Wohnort",
  labels: ["Moosburg", "Auswärtig"],
  categories: [1, 2],
};
const FILTER = [ALTER, ORT];

const records = [
  { age: 0, ort: 1 },
  { age: 1, ort: 2 },
  { age: 2, ort: 1 },
  { age: 3, ort: 1 },
  { age: 4, ort: 2 },
  { age: null, ort: 1 },
];

describe("applyFilters", () => {
  it("ohne Auswahl bleiben alle Antworten", () => {
    expect(applyFilters(records, FILTER, {})).toHaveLength(6);
  });

  it("eine Option mit mehreren Codes trifft jeden davon", () => {
    expect(applyFilters(records, FILTER, { age: [0] }).map((r) => r.age)).toEqual([0, 1]);
    expect(applyFilters(records, FILTER, { age: [2] }).map((r) => r.age)).toEqual([3, 4]);
  });

  it("verbindet Optionen eines Filters mit oder, Filter untereinander mit und", () => {
    expect(applyFilters(records, FILTER, { age: [0, 1] })).toHaveLength(3);
    // Auswahl sind Indizes der Optionen: ort 0 = Moosburg (Code 1).
    expect(applyFilters(records, FILTER, { age: [0], ort: [0] }).map((r) => r.age)).toEqual([0]);
  });

  it("„ohne Angabe“ trifft, was keine Option trifft", () => {
    const sel = { age: [ohneAngabeIndex(ALTER)] };
    expect(applyFilters(records, FILTER, sel).map((r) => r.age)).toEqual([null]);
  });

  it("Altersgruppen als Bereiche", () => {
    const spanne: FilterSpec = {
      key: "j",
      source: "jahre",
      type: "histogram_range",
      label: "Alter",
      groups: [
        { label: "bis 29", min: 0, max: 29 },
        { label: "ab 30", min: 30, max: 120 },
      ],
    };
    const r = [{ jahre: 20 }, { jahre: 30 }, { jahre: 45 }, {}];
    expect(applyFilters(r, [spanne], { j: [1] })).toHaveLength(2);
    expect(applyFilters(r, [spanne], { j: [ohneAngabeIndex(spanne)] })).toEqual([{}]);
  });
});

describe("Auswahl in der Adresse", () => {
  it("übersteht Schreiben und Lesen", () => {
    const params = writeSelections(new URLSearchParams("x=1"), { age: [0, 2], ort: [] }, FILTER);
    expect(params.toString()).toBe("x=1&age=0%2C2");
    expect(readSelections(params, FILTER)).toEqual({ age: [0, 2] });
  });

  it("toggleOption fügt sortiert hinzu und nimmt wieder weg", () => {
    const a = toggleOption({}, "age", 2);
    const b = toggleOption(a, "age", 0);
    expect(b.age).toEqual([0, 2]);
    expect(toggleOption(b, "age", 2).age).toEqual([0]);
  });
});

describe("Mindestzahl", () => {
  it("ist fünf", () => {
    expect(MIN_N).toBe(5);
  });

  it("sperrt kleine Optionen, lässt gewählte aber abwählen", () => {
    expect(waehlbar(4, false)).toBe(false);
    expect(waehlbar(5, false)).toBe(true);
    expect(waehlbar(1, true)).toBe(true);
  });
});
