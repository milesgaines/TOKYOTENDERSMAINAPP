import Image from "next/image";
import FlavorPicker from "./flavor-picker";
import Gallery from "./gallery";
import Price from "./price";
import ScrollFx from "./scroll-fx";
import {
  ALLERGEN,
  COMBOS,
  DRINKS,
  DRINK_PRICE,
  FLAVORS,
  MAPS_URL,
  SAUCES,
  SHAKES,
  SHAKE_LINEUP,
  SHOP,
  SINGLES,
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
                Gluten-free fryer
              </span>
              <span>
                <i />
                {FLAVORS.length} flavors
              </span>
              <span>
                <i />
                {SAUCES.length} sauces
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

            <div className="board">
              <div className="board__top reveal">
                <Image src="/badge.png" alt={SHOP.name} width={104} height={104} />
                <p className="display">
                  Come hungry <span>·</span> Leave happy
                </p>
              </div>

              <div className="board__cols">
                <div className="panel reveal">
                  <h3 className="panel__title">Combos</h3>
                  {COMBOS.map((c, i) => (
                    <div className="line reveal" key={c.name} style={stagger(i)}>
                      <span className="line__n">{c.n}</span>
                      <span className="line__body">
                        <span className="line__name">{c.name}</span>
                        <br />
                        <span className="line__detail">{c.detail}</span>
                      </span>
                      <Price value={c.price} />
                    </div>
                  ))}
                </div>

                <div className="panel reveal" style={stagger(1, 110)}>
                  <h3 className="panel__title">Shakes</h3>
                  <Image className="panel__hero" src={SHAKE_LINEUP} alt="Matcha, vanilla, chocolate and strawberry shakes" width={646} height={304} />
                  {SHAKES.map((s, i) => (
                    <div className="line reveal" key={s.name} style={stagger(i)}>
                      <span />
                      <span className="line__body">
                        <span className="line__name">{s.name}</span>
                        {s.size && <span className="line__size">{s.size}</span>}
                      </span>
                      <Price value={s.price} />
                    </div>
                  ))}
                </div>

                <div className="panel reveal" style={stagger(2, 110)}>
                  <h3 className="panel__title">Single order</h3>
                  {SINGLES.map((s, i) => (
                    <div className="line reveal" key={s.name} style={stagger(i)}>
                      <span />
                      <span className="line__body">
                        <span className="line__name">{s.name}</span>
                        {s.detail && (
                          <>
                            <br />
                            <span className="line__detail">{s.detail}</span>
                          </>
                        )}
                      </span>
                      <Price value={s.price} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="strip reveal">
                <h3 className="panel__title">Sauces</h3>
                <div className="strip__grid">
                  {SAUCES.map((s, i) => (
                    <div className="sauce pop reveal" key={s.name} style={stagger(i, 55)}>
                      <Image className="sauce__pot" src={s.img} alt="" width={196} height={122} />
                      <span className="sauce__name">
                        {s.name}
                        {s.note && <em>{s.note}</em>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="strip reveal">
                <h3 className="panel__title">
                  Drinks <span className="line__price">{money(DRINK_PRICE)}</span>
                </h3>
                <div className="strip__grid">
                  {DRINKS.map((d, i) => (
                    <div className="drink pop reveal" key={d.name} style={stagger(i, 55)}>
                      {d.img && <Image className="drink__can" src={d.img} alt="" width={144} height={216} />}
                      {d.name}
                      <span>{d.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="board__foot reveal">
                <p className="board__pills">
                  <span>
                    <b>Gluten-free</b> fryer
                  </span>
                  <span>
                    Made with <b>love</b> every time
                  </span>
                  <span>
                    Thank you for <b>supporting local</b>
                  </span>
                </p>
                <p className="board__allergen">
                  <b>Allergen notice:</b> {ALLERGEN}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Gallery />

        {/* ── Vibe ─────────────────────────────────────────── */}
        <section className="sec" id="vibe">
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
                Marinated 24 hours, tossed to order, out of a dedicated gluten-free fryer. Come hungry. That part is not
                a slogan.
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
              <Image src="/rooster.png" alt="" width={1759} height={2131} />
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
