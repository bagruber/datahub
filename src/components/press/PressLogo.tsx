import type { PressOutlet } from "@/lib/data";

type RenderMode = "tint" | "plate";

const OUTLET_CONFIG: Record<
  PressOutlet,
  { name: string; bg: string; mode: RenderMode }
> = {
  // `tint` outlets ship a single-colour silhouette logo and look correct
  // when the shape is masked white onto the brand-coloured square.
  sz:     { name: "Süddeutsche Zeitung", bg: "#29293a", mode: "tint" },
  merkur: { name: "Münchner Merkur",     bg: "#008bd0", mode: "tint" },
  mz:     { name: "Moosburger Zeitung",  bg: "#e30713", mode: "tint" },
  // `plate` outlets ship a multi-colour illustrative logo where masking
  // would flatten detail. We render them as-is on a white card.
  idowa:  { name: "idowa",               bg: "#ffffff", mode: "plate" },
};

type Props = {
  outlet: PressOutlet;
  /** Pixel size of the square. */
  size?: number;
};

/** Press-outlet badge. Two render modes:
 *
 *  • `tint`  — brand-colour square; the SVG's alpha shape is used as a mask
 *    and the foreground is forced to white. Robust to whatever fill the
 *    source SVG uses (works for both white-on-transparent and brand-colour
 *    silhouette logos).
 *
 *  • `plate` — white card with a subtle border; the logo is embedded as-is
 *    so its own colours render. Used for multi-colour marks where masking
 *    would collapse detail.
 */
export function PressLogo({ outlet, size = 36 }: Props) {
  const { name, bg, mode } = OUTLET_CONFIG[outlet];
  const url = `${import.meta.env.BASE_URL}press/${outlet}.svg`;

  const baseClasses = "inline-grid place-items-center rounded-md shrink-0";

  if (mode === "plate") {
    return (
      <span
        role="img"
        aria-label={name}
        title={name}
        className={`${baseClasses} border border-ink-line`}
        style={{ width: size, height: size, background: bg }}
      >
        <img
          src={url}
          alt=""
          className="block"
          style={{ width: size * 0.78, height: size * 0.78, objectFit: "contain" }}
        />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={baseClasses}
      style={{ width: size, height: size, background: bg }}
    >
      <span
        aria-hidden
        className="block"
        style={{
          width: size * 0.78,
          height: size * 0.78,
          backgroundColor: "#fff",
          WebkitMaskImage: `url(${url})`,
          maskImage: `url(${url})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    </span>
  );
}

export const PRESS_OUTLET_NAMES = Object.fromEntries(
  Object.entries(OUTLET_CONFIG).map(([k, v]) => [k, v.name]),
) as Record<PressOutlet, string>;
