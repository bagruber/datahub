import { CREAM, INK, INK_LINE, RADIUS } from "@/lib/palette";

type ChipProps = {
  /** Centre x of the chip in viewBox units. */
  x: number;
  /** Centre y of the chip in viewBox units. */
  y: number;
  text: string;
  /** Optional second line, smaller. */
  sub?: string;
  /** Border colour — defaults to ink-line. Pass own-colour for emphasis. */
  borderColor?: string;
  fontSize?: number;
  /** When true, text uses the brand red ink for emphasis. */
  emphasized?: boolean;
};

// Width approximation for Inter at given px size. Good enough for the short
// numeric/label strings we put in chips. Avoids flicker from getBBox-on-mount.
function approxWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.58;
}

/** White-cream pill annotation that sits on top of a coloured data shape.
 *  One unified visual used in all SVG-based charts (venn regions, pie centre,
 *  radar tooltips). Plot-based charts use a `paintOrder: 'stroke'` halo on
 *  text marks which renders to the same intent. */
export function Chip({ x, y, text, sub, borderColor, fontSize = 11, emphasized }: ChipProps) {
  const padX = 8;
  const padY = 4;
  const w1 = approxWidth(text, fontSize);
  const w2 = sub ? approxWidth(sub, fontSize - 1) : 0;
  const w = Math.max(w1, w2) + padX * 2;
  const lineH = fontSize + 2;
  const h = (sub ? lineH * 2 : lineH) + padY * 2;
  const rx = RADIUS.chip;

  return (
    <g pointerEvents="none">
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={rx}
        fill={CREAM}
        fillOpacity={0.94}
        stroke={borderColor ?? INK_LINE}
        strokeWidth={1}
      />
      <text
        x={x}
        y={sub ? y - h / 2 + padY + lineH * 0.75 : y}
        textAnchor="middle"
        dominantBaseline={sub ? "middle" : "central"}
        fill={emphasized ? "#9b0000" : INK}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {text}
      </text>
      {sub && (
        <text
          x={x}
          y={y + h / 2 - padY - lineH * 0.25}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#555"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: fontSize - 1,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {sub}
        </text>
      )}
    </g>
  );
}
