import { SHOP } from "@/lib/menu";

/** One egg in the nest: rocks, cracks, and pops a chick out on a loop. */
function Egg({ i, x, y, delay }: { i: number; x: number; y: number; delay: string }) {
  const clip = `hatch-clip-${i}`;
  return (
    <g className="hatch__egg" transform={`translate(${x} ${y})`} style={{ ["--delay" as string]: delay }}>
      <clipPath id={clip}>
        <rect x="-22" y="-40" width="44" height="38" />
      </clipPath>
      <g className="hatch__wobble">
        <ellipse className="hatch__shadow" cx="0" cy="27" rx="16" ry="4" />
        {/* bottom shell */}
        <path
          className="hatch__cup"
          d="M-18 -2 L-12 -6 L-6 -1 L0 -6 L6 -1 L12 -6 L18 -2 C18 12 12 24 0 24 C-12 24 -18 12 -18 -2 Z"
        />
        {/* the chick, clipped to only show above the shell rim */}
        <g clipPath={`url(#${clip})`}>
          <g className="hatch__chick">
            <ellipse cx="0" cy="4" rx="10" ry="9" fill="var(--chick)" />
            <circle cx="0" cy="-6" r="7" fill="var(--chick)" />
            <path className="hatch__tuft" d="M0 -13 q-3 -4 1 -7 q4 3 1 7 Z" fill="var(--chick-2)" />
            <path d="M5 -7 L12 -5 L5 -3 Z" fill="var(--beak)" />
            <circle cx="-2.4" cy="-7" r="1.3" fill="var(--ink)" />
            <circle cx="3" cy="-7" r="1.3" fill="var(--ink)" />
          </g>
        </g>
        {/* top shell (lifts off) */}
        <path
          className="hatch__shell"
          d="M-18 -2 C-18 -20 -10 -30 0 -30 C10 -30 18 -20 18 -2 L12 -6 L6 -1 L0 -6 L-6 -1 L-12 -6 Z"
        />
      </g>
    </g>
  );
}

/** The "Hatched 2026" moment — a mama hen hatching her chicks, fully animated. */
export default function HatchScene() {
  return (
    <div className="hatch">
      <svg
        className="hatch__svg"
        viewBox="0 0 420 280"
        role="img"
        aria-label="A mama hen hatching her chicks in a nest"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hatch-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--orange-lit)" />
            <stop offset="1" stopColor="var(--orange)" />
          </linearGradient>
          <linearGradient id="hatch-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff8a44" />
            <stop offset="1" stopColor="var(--orange-lit)" />
          </linearGradient>
          <linearGradient id="hatch-egg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffdf9" />
            <stop offset="1" stopColor="#ffe9cf" />
          </linearGradient>
        </defs>

        {/* nest — back rim */}
        <ellipse cx="210" cy="234" rx="184" ry="30" fill="var(--straw-d)" />
        <ellipse cx="210" cy="228" rx="160" ry="22" fill="var(--straw-l)" />
        {[-150, -110, -70, 70, 110, 150, 30, -20].map((sx, k) => (
          <line
            key={k}
            className="hatch__straw"
            x1={210 + sx}
            y1={224 + (k % 2 ? 2 : -2)}
            x2={210 + sx + (k % 2 ? 22 : -22)}
            y2={230}
          />
        ))}

        {/* ── Mama hen ─────────────────────────────── */}
        <g className="hatch__hen">
          {/* tail feathers */}
          <path
            d="M78 180 Q34 156 26 122 Q54 140 74 154 Q46 122 46 96 Q74 130 96 156 Z"
            fill="var(--orange)"
          />
          {/* body (breathes) */}
          <g className="hatch__body">
            <ellipse cx="150" cy="188" rx="95" ry="64" fill="url(#hatch-body)" />
            {/* wing (flutters) */}
            <g className="hatch__wing">
              <path d="M150 150 Q214 150 216 198 Q182 216 150 206 Q126 184 150 150 Z" fill="var(--orange)" />
              <path d="M168 168 Q196 172 204 196" fill="none" stroke="var(--comb)" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
              <path d="M162 182 Q188 186 196 202" fill="none" stroke="var(--comb)" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
            </g>
          </g>
          {/* head + neck (clucks) */}
          <g className="hatch__head">
            <path d="M198 156 Q202 122 224 110 L250 150 Z" fill="url(#hatch-head)" />
            <circle cx="234" cy="120" r="34" fill="url(#hatch-head)" />
            {/* comb */}
            <circle cx="216" cy="94" r="9" fill="var(--comb)" />
            <circle cx="233" cy="87" r="10" fill="var(--comb)" />
            <circle cx="250" cy="93" r="9" fill="var(--comb)" />
            {/* wattle */}
            <path d="M259 140 q9 7 3 18 q-9 -3 -9 -14 z" fill="var(--comb)" />
            {/* beak */}
            <path d="M263 122 L286 128 L263 135 Z" fill="var(--beak)" />
            {/* eye */}
            <g className="hatch__eye">
              <circle cx="245" cy="115" r="6.5" fill="#fffdf9" />
              <circle cx="247" cy="115" r="3.3" fill="var(--ink)" />
            </g>
          </g>
        </g>

        {/* a hatched chick, hopping in front of the nest (outer group positions,
            inner group animates — a CSS transform would otherwise wipe the translate) */}
        <g transform="translate(120 206)">
          <g className="hatch__hop">
            <ellipse className="hatch__shadow" cx="0" cy="16" rx="12" ry="3.5" />
            <ellipse cx="0" cy="2" rx="11" ry="10" fill="var(--chick)" />
            <circle cx="0" cy="-9" r="8" fill="var(--chick)" />
            <path className="hatch__tuft" d="M0 -17 q-3 -5 1 -8 q4 3 1 8 Z" fill="var(--chick-2)" />
            <path d="M6 -10 L15 -8 L6 -6 Z" fill="var(--beak)" />
            <circle cx="-2.6" cy="-10" r="1.5" fill="var(--ink)" />
            <circle cx="3.4" cy="-10" r="1.5" fill="var(--ink)" />
            <line x1="-4" y1="12" x2="-4" y2="18" stroke="var(--beak)" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="12" x2="4" y2="18" stroke="var(--beak)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* three hatching eggs, staggered */}
        <Egg i={0} x={286} y={210} delay="0s" />
        <Egg i={1} x={330} y={214} delay="-2s" />
        <Egg i={2} x={372} y={208} delay="-4s" />

        {/* front straw lip, over the egg bottoms */}
        <path
          d="M40 226 Q210 262 380 226 Q210 246 40 226 Z"
          fill="var(--straw-d)"
          opacity="0.9"
        />
      </svg>
      <p className="display hatch__cap">
        {SHOP.since.replace(/\s*\d{4}$/, "")} <span>2026</span>
      </p>
    </div>
  );
}
