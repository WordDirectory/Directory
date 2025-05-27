import { ImageResponse } from "next/og";
import { capitalize } from "@/lib/utils";

export const alt = "Word definition from WordDirectory";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Logo SVG as a component
const Logo = () => (
  <svg
    width="61"
    height="56"
    viewBox="0 0 61 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <rect width="61" height="56" fill="url(#pattern0_32_4)" />
    <defs>
      <pattern
        id="pattern0_32_4"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use xlinkHref="#image0_32_4" transform="scale(0.0163934 0.0178571)" />
      </pattern>
      <image
        id="image0_32_4"
        width="61"
        height="56"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAA4CAYAAABOr/BaAAADNElEQVRoBe2bu4vVUBDG9w/YShG10GJha18riLuFgiALdvYWgnZiLXa+sFgQLBV8FFrbaCVooayF+GhUtPbVaOGj/XnnktydzMnNTTIn514wgUtmTma+b76Z5GyxydycOoBjwH3gHe2PH8AH4DFwDtirKCaawBJwPssXnJ/tSxnquAesBsTAZuCBA3xS6ssB/u6AWC0A+4DXk4Ac10XfphEl8MgB1iR1bUSqDGCtCYgj9uGQFjjpAGmTug5sEXJg++CRkrsg5XFCiF+kZMy4vgAHga9T4H4mor9NgXialJ9F9H93VIpWe01tE1gEjg92yuvObkq+4CzWJleBVdzRRStewT7c4vGRx21F47SxpyZaigW2NtiwZGMb7uxthOqcqYrOhK9WFaGuHdWFe2yFGZid3t66aOBOwF5cuK3jvXYRuuilFL1SpA68Za9QnR+gq4WUoncq3jJzhy7aa5cR5GvJRIuInLTs7BVp88s48rXZKcRW7fRzgWXnXrTtirPZQbrF134Q7FzQ2NbuJx10xNltm27xtW9jvb7GtnY/6aAj3nabfIuvfRPqdjW2tftJBx1x97sIYPG1X4z0exrb2v2kg474G15AsPjaLwRGcDS2tftJBx2J0HENYfG1r+Ni2Brb2v2kg47EaLnCsPjaV2FRTI1t7X7SQUei9HwDxOJrfyMqjqWxrd1POuhInKaPUCy+9kdBkQyNbe1+0kFHInU9h7H42s9jYp01trX7SQcdidX2DMfiaz8yVfUwNbG1kxYSmcxq0X51R1IWkpJLd6DEPgS0/S0DC1pLCf5oycQtyP+oHdxS89ijctJjs5pfeFPjzQR58+Btc+jmGSK6yxfWmlfUfcYrEX23e56ZYrglovfPVEndF7NnuH8AV7vnmgmGi3rDlImfBf7MRGnxi/gNnCkIzp3sXc3TwE3gyeBPxlPH7znwvWX98lqV5Hv4pf4bwClgW64xyTl7h7zuHfQLOJKksK5JgAM1J77UdS1J8YErE4RfSFpQCjL5rGGC6F0p6kjOUSU6eTGpCIFPY4R/TFVDch7g8hjRl5IXk4pw8IHKPHANeA/8zc7y0cp8qhqE5x92lpNUpbAosQAAAABJRU5ErkJggg=="
      />
    </defs>
  </svg>
);

export default async function Image({ params }: { params: { word: string } }) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "213px 130px",
          gap: "52px",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          <Logo />
          <b style={{ fontSize: "45px", color: "white", fontWeight: 800 }}>
            WordDirectory
          </b>
        </div>
        <div
          style={{
            fontSize: "80px",
            fontWeight: 900,
            color: "white",
            textAlign: "center",
          }}
        >
          {capitalize(params.word)}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
