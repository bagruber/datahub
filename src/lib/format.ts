const intFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export const fmtInt = (v: number) => intFormat.format(v);
export const fmtPct = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 0 }).format(v);
export const fmtPct1 = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 1 }).format(v);
