import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const DIR = path.join(process.cwd(), "public", "images");
const EXT = /\.(jpe?g|png|webp|avif)$/i;

/** Filename (sans extension, lowercased) → caption. Anything unlisted gets a title-cased fallback. */
const CAPTIONS: Record<string, string> = {
  storefront: "The Spot",
  truck: "The Truck",
  "tenders-crispy": "Crispy Tenders",
  sandwich: "Tokyo Crunch",
  combo: "Combo Meal",
  "family-box": "Family Box",
  fries: "Golden Fries",
  lemonade: "Fresh Lemonade",
};

const caption = (file: string) => {
  const key = file.replace(EXT, "").toLowerCase();
  return CAPTIONS[key] ?? key.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

function shots() {
  try {
    return fs
      .readdirSync(DIR)
      .filter((f) => EXT.test(f))
      .sort();
  } catch {
    return [];
  }
}

/** Renders nothing until photos land in public/images/. Drop files in, the section appears. */
export default function Gallery() {
  const files = shots();
  if (!files.length) return null;

  return (
    <section className="sec sec--tint" id="gallery">
      <div className="shell">
        <div className="sec__head reveal">
          <p className="eyebrow leaf">The vibe</p>
          <h2 className="display sec__title">
            The <span>gallery</span>
          </h2>
        </div>
        <div className="gallery">
          {files.map((f, i) => (
            <figure className="shot reveal" key={f} style={{ ["--d" as string]: `${i * 70}ms` }}>
              <Image src={`/images/${f}`} alt={caption(f)} width={900} height={900} sizes="(max-width: 700px) 50vw, 25vw" />
              <figcaption>{caption(f)}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
