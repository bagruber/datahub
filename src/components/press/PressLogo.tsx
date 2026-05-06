import type { PressOutlet } from "@/lib/data";

const OUTLET_BG: Record<PressOutlet, string> = {
  sz:     "#29293a",
  merkur: "#008bd0",
  mz:     "#e30713",
  idowa:  "#0a3d6b", // placeholder; swap when official guideline is known
};

const OUTLET_NAME: Record<PressOutlet, string> = {
  sz:     "Süddeutsche Zeitung",
  merkur: "Münchner Merkur",
  mz:     "Moosburger Zeitung",
  idowa:  "idowa",
};

type Props = {
  outlet: PressOutlet;
  /** Pixel size of the square. */
  size?: number;
};

/** Press-outlet badge: white monogram on the brand-colour square with a
 *  card-style 4 px corner radius. SVGs in /public/press/ are rendered
 *  white via a CSS mask so we keep one set of files even if the brand
 *  colour changes — the SVG's own fills are ignored. */
export function PressLogo({ outlet, size = 36 }: Props) {
  const bg = OUTLET_BG[outlet];
  const url = `${import.meta.env.BASE_URL}press/${outlet}.svg`;
  return (
    <span
      role="img"
      aria-label={OUTLET_NAME[outlet]}
      title={OUTLET_NAME[outlet]}
      className="inline-grid place-items-center rounded-md shrink-0"
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

export const PRESS_OUTLET_NAMES = OUTLET_NAME;
