import type { PressOutlet } from "@/lib/data";

// Logos and colours are copies of moosburg-design/assets/presse. idowa is the
// Moosburger Zeitung online and wears its badge.
const OUTLET_CONFIG: Record<
  PressOutlet,
  { name: string; bg: string; file: string }
> = {
  sz:     { name: "Süddeutsche Zeitung",  bg: "#29293a", file: "sz" },
  merkur: { name: "Münchner Merkur",      bg: "#008bd0", file: "merkur" },
  br:     { name: "Bayerischer Rundfunk", bg: "#0082c6", file: "br" },
  mz:     { name: "Moosburger Zeitung",   bg: "#e20c15", file: "mz" },
  idowa:  { name: "idowa",                bg: "#e20c15", file: "mz" },
};

type Props = {
  outlet: PressOutlet;
  /** Pixel size of the square. */
  size?: number;
};

/** Press-outlet badge: brand-colour square; the SVG's alpha shape is used as
 *  a mask and the foreground is forced to white, at 70 % of the square.
 *  Robust to whatever fill the source SVG uses. */
export function PressLogo({ outlet, size = 36 }: Props) {
  const { name, bg, file } = OUTLET_CONFIG[outlet];
  const url = `${import.meta.env.BASE_URL}press/${file}.svg`;

  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className="inline-grid place-items-center rounded-md shrink-0"
      style={{ width: size, height: size, background: bg }}
    >
      <span
        aria-hidden
        className="block"
        style={{
          width: size * 0.7,
          height: size * 0.7,
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
