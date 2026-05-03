import { format } from "d3-format";

export const fmtInt = format(",d");
export const fmtPct = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 0 }).format(v);
export const fmtPct1 = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 1 }).format(v);
