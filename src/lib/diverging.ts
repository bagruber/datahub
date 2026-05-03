// Diverging stacked-bar layout helper.
// Given a list of shares and which indices belong to the negative side, the
// (optional) neutral center, and the positive side, returns one segment per
// share with x1/x2 coordinates around 0.
//
// Example for a 5-point Likert:
//   shares = [s1, s2, s3, s4, s5]
//   negative = [1, 0]    // share at index 1 (rating 2) sits closer to centre, index 0 (rating 1) furthest left
//   center   = 2          // share at index 2 (neutral rating 3) straddles 0
//   positive = [3, 4]    // rating 4 closest to centre, rating 5 furthest right
//
// Example for a 6-point Likert (no neutral):
//   negative = [2, 1, 0]
//   center   = undefined  // no straddle, both stacks meet at 0
//   positive = [3, 4, 5]

export type DivergingSegment = { idx: number; x1: number; x2: number };

export function divergingStack(
  shares: number[],
  args: { negative: number[]; center?: number; positive: number[] },
): DivergingSegment[] {
  const out: DivergingSegment[] = [];
  let centerLeft = 0;
  let centerRight = 0;

  if (args.center !== undefined) {
    const c = shares[args.center] ?? 0;
    centerLeft = -c / 2;
    centerRight = c / 2;
    out.push({ idx: args.center, x1: centerLeft, x2: centerRight });
  }

  let cur = centerLeft;
  for (const idx of args.negative) {
    const s = shares[idx] ?? 0;
    const x2 = cur;
    const x1 = cur - s;
    out.push({ idx, x1, x2 });
    cur = x1;
  }

  cur = centerRight;
  for (const idx of args.positive) {
    const s = shares[idx] ?? 0;
    const x1 = cur;
    const x2 = cur + s;
    out.push({ idx, x1, x2 });
    cur = x2;
  }

  return out;
}
