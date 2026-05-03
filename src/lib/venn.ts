// Area-proportional 2-circle Venn layout — same idea as venn.js
// (https://github.com/benfred/venn.js) but stripped down to what we need.
// 3-circle support can be added later when a dataset calls for it.

/** Lens (intersection) area between two circles of radii rA, rB whose centres
 *  are distance d apart. Closed-form; well known. */
export function lensArea(d: number, rA: number, rB: number): number {
  if (d >= rA + rB) return 0;
  if (d <= Math.abs(rA - rB)) return Math.PI * Math.min(rA, rB) ** 2;
  const ka = (d * d + rA * rA - rB * rB) / (2 * d * rA);
  const kb = (d * d + rB * rB - rA * rA) / (2 * d * rB);
  const term =
    (-d + rA + rB) * (d + rA - rB) * (d - rA + rB) * (d + rA + rB);
  return (
    rA * rA * Math.acos(Math.min(1, Math.max(-1, ka))) +
    rB * rB * Math.acos(Math.min(1, Math.max(-1, kb))) -
    0.5 * Math.sqrt(Math.max(0, term))
  );
}

/** Find centre-distance d such that lensArea(d, rA, rB) ≈ targetOverlap.
 *  lensArea is monotonically decreasing in d on [|rA-rB|, rA+rB], so we
 *  can bisect. */
export function distanceForOverlap(rA: number, rB: number, targetOverlap: number): number {
  const minD = Math.abs(rA - rB);
  const maxD = rA + rB;
  if (targetOverlap <= 0) return maxD;
  const minOverlap = Math.PI * Math.min(rA, rB) ** 2;
  if (targetOverlap >= minOverlap) return minD;

  let lo = minD;
  let hi = maxD;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const a = lensArea(mid, rA, rB);
    if (a > targetOverlap) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Layout for two area-proportional circles. Returned coordinates are in the
 *  same unit as the input counts (i.e. "1 unit² = 1 record"); scale to the
 *  desired pixel size at render time. */
export type Venn2Layout = {
  rA: number;
  rB: number;
  d: number;
  /** Bounding box: width across both circles, height of taller circle * 2. */
  width: number;
  height: number;
  /** x-coordinates of circle centres (in unit space, horizontally aligned). */
  cxA: number;
  cxB: number;
  /** y-coordinate of both centres. */
  cy: number;
  /** Mid-x used for label placement of the intersection. */
  cxMid: number;
};

export function layoutVenn2(setA: number, setB: number, both: number): Venn2Layout | null {
  if (setA <= 0 || setB <= 0) return null;
  const rA = Math.sqrt(setA / Math.PI);
  const rB = Math.sqrt(setB / Math.PI);
  const safeBoth = Math.min(both, setA, setB);
  const d = distanceForOverlap(rA, rB, safeBoth);
  const cxA = rA;
  const cxB = rA + d;
  const cy = Math.max(rA, rB);
  const width = cxB + rB;
  const height = cy * 2;
  return { rA, rB, d, width, height, cxA, cxB, cy, cxMid: (cxA + cxB) / 2 };
}
