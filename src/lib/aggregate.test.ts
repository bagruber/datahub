import { describe, expect, it } from "vitest";
import {
  answeredCount,
  countByBins,
  countByCodebook,
  countByObjectKeys,
  distributionOnScale,
  meanOf,
} from "./aggregate";

describe("answeredCount", () => {
  it("zählt weder leere Werte noch leere Listen oder Objekte", () => {
    const r = [{ v: 1 }, { v: 0 }, { v: null }, { v: "" }, { v: [] }, { v: {} }, {}, { v: [2] }, { v: { a: 1 } }];
    expect(answeredCount(r, "v")).toBe(4);
  });
});

describe("countByCodebook", () => {
  it("teilt durch die Beantwortenden, Mehrfachnennungen zählen je Code", () => {
    const r = [{ v: [1, 2] }, { v: [1] }, { v: 2 }, { v: null }];
    const { rows, n } = countByCodebook(r, "v", { "1": "Zu Fuß", "2": "Rad" });
    expect(n).toBe(3);
    expect(rows).toEqual([
      { label: "Zu Fuß", count: 2, share: 2 / 3 },
      { label: "Rad", count: 2, share: 2 / 3 },
    ]);
  });
});

describe("countByBins", () => {
  it("zählt jede Antwort je Gruppe höchstens einmal", () => {
    const r = [{ v: [1, 2] }, { v: 3 }, { v: 4 }];
    const { rows } = countByBins(r, "v", [
      { label: "eins oder zwei", vals: [1, 2] },
      { label: "drei", vals: [3] },
    ]);
    expect(rows.map((x) => x.count)).toEqual([1, 1]);
  });
});

describe("countByObjectKeys", () => {
  it("zählt vorhandene Schlüssel", () => {
    const r = [{ t: { a: 1, b: 2 } }, { t: { a: 3 } }, { t: null }];
    const { rows, n } = countByObjectKeys(r, "t", [
      { key: "a", label: "A" },
      { key: "b", label: "B" },
    ]);
    expect(n).toBe(2);
    expect(rows.map((x) => x.count)).toEqual([2, 1]);
  });
});

describe("Skalen", () => {
  const r = [{ s: 1 }, { s: 3 }, { s: 3 }, { s: 5 }, { s: 9 }, { s: null }];

  it("verteilt nur Werte auf der Skala", () => {
    const d = distributionOnScale(r, "s", [1, 2, 3, 4, 5]);
    expect(d.n).toBe(4);
    expect(d.counts).toEqual([1, 0, 2, 0, 1]);
  });

  it("mittelt alle Zahlen", () => {
    expect(meanOf(r, "s")).toEqual({ mean: 21 / 5, n: 5 });
    expect(Number.isNaN(meanOf([], "s").mean)).toBe(true);
  });
});
