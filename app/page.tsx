import Image from "next/image";
import FlavorPicker from "./flavor-picker";
import Gallery from "./gallery";
import Price from "./price";
import ScrollFx from "./scroll-fx";
import {
  ALLERGEN,
  COMBOS,
  EXTRA_SAUCE,
  FLAVORS,
  MAPS_URL,
  SAUCES,
  SHAKES,
  SHAKE_PRICE,
  SHOP,
  SIDES,
  STATS,
  TICKER,
  VIBE_TAGS,
  money,
} from "@/lib/menu";

const stagger = (i: number, step = 60) => ({ ["--d" as string]: `${i * step}ms` });

const NAV = [
  ["Flavors", "#flavors"],
  ["Menu", "#menu"],
  ["The vibe", "#vibe"],
  ["Find us", "#visit"],
];

export default function Home() {
  return (
    <>
      <ScrollFx />

      <header className="nav">
        <a className="nav__mark display" href="#top">
          <Image src="/badge.png" alt="" width={34} height={34} priority />
          Tokyo <b>Tenders</b>
        </a>
        <nav className="nav__links">
          {NAV.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="btn btn--fill" href={SHOP.phoneHref}>
          Call us
        </a>
      </header>

      <main id="top">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero__glow" aria-hidden />
          <div className="shell hero__inner">
            <a className="pill" href={MAPS_URL} target="_blank" rel="noreferrer">
              <i />
              {SHOP.street} — {SHOP.city}, {SHOP.state}
            </a>
            <h1 className="display hero__wordmark">
              Tokyo <span>Tenders</span>
            </h1>
            <Image
              className="hero__bird"
              src="/rooster.png"
              alt="The Tokyo Tenders rooster"
              width={1759}
              height={2131}
              priority
            />
            <p className="display hero__tag">
              Come hungry <span>·</span> Leave happy
            </p>
            <div className="hero__cta">
              <a className="btn btn--fill" href="#menu">
                See the menu
              </a>
              <a className="btn btn--ghost" href={SHOP.phoneHref}>
                {SHOP.phone}
              </a>
            </div>
            <p className="hero__badges">
              <span>
                <i />
                100% gluten-free
              </span>
              <span>
                <i />
                {FLAVORS.length} flavors
              </span>
              <span>
                <i />
                Made fresh
              </span>
              <span>
                <i />
                {SHOP.opening}
              </span>
            </p>
          </div>
        </section>

        {/* ── Ticker ───────────────────────────────────────── */}
        <div className="ticker" aria-hidden>
          <div className="ticker__track">
            {[0, 1].map((k) => (
              <div key={k} className="display">
                {TICKER.map((t) => (
                  <span key={t}>
                    {t} <em>✦</em>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────── */}
        <section className="sec">
          <div className="shell stats">
            {STATS.map((s, i) => (
              <div className="stat reveal" key={s.label} style={{ ["--d" as string]: `${i * 70}ms` }}>
                <b>{s.n}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Flavors ──────────────────────────────────────── */}
        <section className="sec sec--tint" id="flavors">
          <div className="shell">
            <div className="sec__head reveal">
              <p className="eyebrow leaf">Choose your flavor</p>
              <h2 className="display sec__title">
                Seven ways to <span>ruin</span> other tenders
              </h2>
              <p className="sec__sub">
                Every tender gets tossed to order. Pick one, pick three — the Deluxe exists for exactly this problem.
              </p>
            </div>
            <FlavorPicker />
          </div>
        </section>

        {/* ── Menu board ───────────────────────────────────── */}
        <section className="sec" id="menu">
          <div className="shell">
            <div className="sec__head reveal">
              <p className="eyebrow leaf">What we're serving</p>
              <h2 className="display sec__title">
                The <span>menu</span>
              </h2>
              <p className="sec__sub">Call ahead or walk in. No app, no fees, no upsell screens.</p>
            </div>

            {/* The printed menu board, rebuilt 1:1 — orange sidebar, combos + boxed
                sides, shakes + sauces split by a rule. */}
            <div className="board reveal">
              <aside className="bside">
                <span className="bside__gf">
                  <b>100%</b>
                  <em>Gluten-Free</em>
                </span>
                <Image className="bside__logo" src="/badge.png" alt={SHOP.name} width={110} height={110} />
                <p className="display bside__tag">
                  Come
                  <br />
                  Hungry
                  <br />
                  <span>
                    Leave
                    <br />
                    Happy
                  </span>
                </p>
                <span className="bside__rule" aria-hidden />
                <p className="bside__sub">
                  Tokyo-Inspired
                  <br />
                  Made Fresh
                </p>
              </aside>

              <div className="bmain">
                <div>
                  <h3 className="display bhead bhead--rule">Choose your flavor</h3>
                  <p className="choose">
                    {FLAVORS.map((f) => (
                      <span key={f.name}>
                        {f.name}
                        {f.note && <em>({f.note})</em>}
                      </span>
                    ))}
                  </p>
                </div>

                <div className="bcols">
                  <div>
                    <h3 className="display bhead bhead--rule bhead--xl">Combos</h3>
                    {COMBOS.map((c, i) => (
                      <div className="crow reveal" key={c.name} style={stagger(i)}>
                        <span className="crow__n" aria-hidden>
                          <b className="display">{c.n}</b>
                        </span>
                        <span className="crow__body">
                          <span className="crow__name">{c.name}</span>
                          <span className="crow__detail">{c.detail}</span>
                        </span>
                        <Price value={c.price} className="crow__price" />
                      </div>
                    ))}
                  </div>

                  <aside className="sidesbox reveal" style={stagger(2, 110)}>
                    <h3 className="display bhead bhead--under">Sides</h3>
                    {SIDES.map((s) => (
                      <div className="srow" key={s.name}>
                        <span className="srow__name">{s.name}</span>
                        {s.detail && <span className="srow__detail">{s.detail}</span>}
                        <Price value={s.price} className="srow__price" />
                      </div>
                    ))}
                  </aside>
                </div>

                <div className="bbottom">
                  <div>
                    <h3 className="display bhead">
                      Shakes <Price value={SHAKE_PRICE} className="bhead__price" />
                    </h3>
                    <div className="shakes">
                      {SHAKES.map((s, i) => (
                        <figure className="shk pop reveal" key={s.name} style={stagger(i, 70)}>
                          <figcaption>{s.name}</figcaption>
                          {s.img && <Image src={s.img} alt={`${s.name} shake`} width={117} height={192} />}
                        </figure>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="display bhead">Sauces</h3>
                    <p className="saucelist">
                      {SAUCES.map((s) => (
                        <span key={s.name}>
                          {s.name}
                          {s.note && <em>({s.note})</em>}
                        </span>
                      ))}
                    </p>
                    <p className="extra">
                      <span>Extra sauce</span>
                      <b>${money(EXTRA_SAUCE)}</b>
                      <span>each</span>
                    </p>
                  </div>
                </div>

                <p className="ballergen">
                  <b>Allergen notice:</b> {ALLERGEN}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Gallery />

        {/* ── Vibe — night-shot band, the truck fades out of the dark ── */}
        <section className="sec vibe-sec" id="vibe">
          <div className="shell vibe">
            <div className="vibe__copy reveal">
              <p className="eyebrow leaf">The vibe</p>
              <h2 className="display vibe__quote">
                We don't just fry chicken. We craft <span>legends</span>.
              </h2>
              <p>
                Born in the streets, made with love in {SHOP.city}. Yuzu, garlic soy, a Peking glaze that belongs on a
                duck — the flavors we grew up chasing across the Valley, on the one thing everybody already agrees on.
              </p>
              <p>
                Marinated 24 hours, tossed to order, 100% gluten-free. Come hungry. That part is not a slogan.
              </p>
              <div className="tags">
                {VIBE_TAGS.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="vibe__art reveal" style={{ ["--d" as string]: "120ms" }}>
              <Image src="/truck.jpg" alt="The Tokyo Tenders truck, serving window open" width={984} height={1070} />
            </div>
          </div>
        </section>

        {/* ── Visit ────────────────────────────────────────── */}
        <section className="sec" id="visit">
          <div className="shell">
            <div className="sec__head reveal">
              <p className="eyebrow leaf">Come find us</p>
              <h2 className="display sec__title">
                Find the <span>flock</span>
              </h2>
            </div>
            <div className="visit">
              <a className="vcard reveal" href={MAPS_URL} target="_blank" rel="noreferrer">
                <span className="vcard__k">Location</span>
                <span className="vcard__v">{SHOP.street}</span>
                <span className="vcard__n">
                  {SHOP.city}, {SHOP.state} {SHOP.zip} · Open in Maps
                </span>
              </a>
              <a className="vcard reveal" style={{ ["--d" as string]: "80ms" }} href={SHOP.phoneHref}>
                <span className="vcard__k">Phone</span>
                <span className="vcard__v">{SHOP.phone}</span>
                <span className="vcard__n">Call ahead, pick it up hot</span>
              </a>
              <a className="vcard reveal" style={{ ["--d" as string]: "160ms" }} href={`mailto:${SHOP.email}`}>
                <span className="vcard__k">Email</span>
                <span className="vcard__v">Say hi</span>
                <span className="vcard__n">{SHOP.email}</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <p className="display foot__mark">
          Tokyo <span>Tenders</span>
        </p>
        <p className="foot__links">
          <a href={MAPS_URL} target="_blank" rel="noreferrer">
            {SHOP.street}
          </a>
          <a href={SHOP.phoneHref}>{SHOP.phone}</a>
          <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
        </p>
        <p className="foot__fine">
          {SHOP.city}, {SHOP.state} {SHOP.zip} · {SHOP.since} · {SHOP.opening}
        </p>
      </footer>

      {/* ── Bottom tab bar ─────────────────────────────────── */}
      <nav className="tabbar" aria-label="Quick links">
        <a href="#top">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
          </svg>
          Home
        </a>
        <a href="#menu">
          <svg viewBox="0 0 24 24" aria-hidden>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          Menu
        </a>
        <a href={SHOP.phoneHref}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
          </svg>
          Call
        </a>
        <a href="#visit">
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 16v-5M12 8h.01" />
          </svg>
          Info
        </a>
      </nav>
    </>
  );
}
