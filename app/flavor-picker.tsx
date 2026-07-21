"use client";
import Image from "next/image";
import { useState } from "react";
import { FLAVORS } from "@/lib/menu";

/** Pick a flavor, the whole section takes its color. The one thing on the page you play with. */
export default function FlavorPicker() {
  const [i, setI] = useState(0);
  const active = FLAVORS[i];
  const vars = { "--c1": active.hue[0], "--c2": active.hue[1] } as React.CSSProperties;

  return (
    <div style={vars}>
      <div className="flavors__grid" role="tablist" aria-label="Chicken flavors">
        {FLAVORS.map((f, n) => (
          <button
            key={f.name}
            role="tab"
            aria-selected={n === i}
            className="chip reveal"
            style={{ "--c1": f.hue[0], "--c2": f.hue[1], "--d": `${n * 45}ms` } as React.CSSProperties}
            onClick={() => setI(n)}
            onMouseEnter={() => setI(n)}
          >
            <Image className="chip__shot" src={f.img} alt="" width={240} height={248} />
            <span className="chip__name">{f.name}</span>
            {f.note && <span className="chip__note">{f.note}</span>}
          </button>
        ))}
      </div>

      <div className="flavors__blurb" aria-live="polite">
        <h3>{active.name}</h3>
        <p>{active.blurb}</p>
      </div>
    </div>
  );
}
