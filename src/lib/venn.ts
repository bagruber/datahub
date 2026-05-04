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

export type Venn3Layout = {
  rA: number; rB: number; rC: number;
  cxA: number; cyA: number;
  cxB: number; cyB: number;
  cxC: number; cyC: number;
  width: number;
  height: number;
};

/** Area-proportional 3-circle layout. Radii from set sizes; pairwise centre
 *  distances solve the lens-area equation per pair (same bisection as 2-circle).
 *  Circles are placed in a triangle whose side lengths equal those distances —
 *  found via the law of cosines. The 3-way intersection (ABC) is *not*
 *  separately optimised; for civic-data audiences the relative magnitudes are
 *  what matter, and full optimisation (venn.js style) is overkill. */
export function layoutVenn3(counts: {
  setA: number; setB: number; setC: number;
  ab: number; ac: number; bc: number;
}): Venn3Layout | null {
  const { setA, setB, setC, ab, ac, bc } = counts;
  if (setA <= 0 || setB <= 0 || setC <= 0) return null;

  const rA = Math.sqrt(setA / Math.PI);
  const rB = Math.sqrt(setB / Math.PI);
  const rC = Math.sqrt(setC / Math.PI);

  const dAB = distanceForOverlap(rA, rB, Math.min(ab, setA, setB));
  const dAC = distanceForOverlap(rA, rC, Math.min(ac, setA, setC));
  const dBC = distanceForOverlap(rB, rC, Math.min(bc, setB, setC));

  // Place B at origin, C along +x at dBC. A is found via law of cosines:
  // for triangle with sides dAB (B-A), dBC (B-C), dAC (A-C),
  // angle at B = arccos((dAB² + dBC² - dAC²) / (2·dAB·dBC)).
  let cxB = 0;
  let cyB = 0;
  let cxC = dBC;
  let cyC = 0;
  let cxA = 0;
  let cyA = 0;

  // Triangle inequality check — if the distances don't form a valid triangle
  // (rare with real data, but guard anyway), fall back to a vertical layout.
  const validTriangle =
    dAB + dBC >= dAC && dAB + dAC >= dBC && dAC + dBC >= dAB;

  if (validTriangle) {
    const cosB = (dAB * dAB + dBC * dBC - dAC * dAC) / (2 * dAB * dBC);
    const sinB = Math.sqrt(Math.max(0, 1 - cosB * cosB));
    cxA = dAB * cosB;
    cyA = -dAB * sinB; // negative = above BC line in SVG y-axis
  } else {
    cxA = dBC / 2;
    cyA = -(dAB + dAC) / 2;
  }

  // Translate so all coordinates are positive (origin = top-left of bbox)
  const xs = [cxA - rA, cxA + rA, cxB - rB, cxB + rB, cxC - rC, cxC + rC];
  const ys = [cyA - rA, cyA + rA, cyB - rB, cyB + rB, cyC - rC, cyC + rC];
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    rA, rB, rC,
    cxA: cxA - minX, cyA: cyA - minY,
    cxB: cxB - minX, cyB: cyB - minY,
    cxC: cxC - minX, cyC: cyC - minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
