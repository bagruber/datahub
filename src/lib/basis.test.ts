import { describe, expect, it } from "vitest";
import type { ChartSpec } from "./data";
import { basiszeile } from "./basis";

const spec = (s: Record<string, unknown>) => s as unknown as ChartSpec;

describe("basiszeile", () => {
  it("nennt die Beantwortenden einer Frage", () => {
    const r = [{ v: 1 }, { v: 2 }, { v: null }];
    expect(basiszeile(spec({ type: "bar_h", source: "v" }), r)).toBe("2 Antworten mit Angabe");
  });

  it("vermerkt Mehrfachnennungen", () => {
    const r = [{ v: [1, 2] }, { v: [1] }];
    expect(basiszeile(spec({ type: "bar_h", source: "v" }), r)).toBe(
      "2 Antworten mit Angabe · Mehrfachnennung möglich",
    );
  });

  it("gibt bei mehreren Fragen die Spanne und die Skala an", () => {
    const r = [{ a: 1, b: 2 }, { a: 3 }, { a: 6, b: 4 }];
    const s = spec({ type: "likert6", items: [{ source: "a" }, { source: "b" }] });
    expect(basiszeile(s, r)).toBe("2 bis 3 Antworten mit Angabe · Skala von 1 bis 6");
  });

  it("schweigt, wenn niemand geantwortet hat oder die Zahlen fremd sind", () => {
    expect(basiszeile(spec({ type: "bar_h", source: "v" }), [{ v: null }])).toBeNull();
    expect(basiszeile(spec({ type: "line_series", series: [] }), [])).toBeNull();
  });
});
