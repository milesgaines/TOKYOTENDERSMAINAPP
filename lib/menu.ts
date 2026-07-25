// The Tokyo Tenders menu — single source of truth for the site.
// Prices are numbers in dollars; the site formats them. Edit here, the whole page follows.

export type Flavor = {
  name: string;
  note?: string;
  /** Two-stop gradient the flavor picker paints the section with. */
  hue: [string, string];
  blurb: string;
  spicy?: boolean;
  sweet?: boolean;
};

export const FLAVORS: Flavor[] = [
  {
    name: "Yuzu Soy",
    hue: ["#FFD24A", "#F08A00"],
    blurb: "Japanese citrus cut with soy — bright, sharp, gone in four bites.",
  },
  {
    name: "Garlic Soy",
    hue: ["#F0E6C8", "#B98A3E"],
    blurb: "Toasted garlic and dark soy. The one you order every time after the first time.",
  },
  {
    name: "Tokyo Peking",
    hue: ["#C9873F", "#5A2A0C"],
    blurb: "Deep, lacquered, five-spice glaze. Peking duck energy on a tender.",
  },
  {
    name: "Buffalo",
    note: "Bold & Spicy",
    hue: ["#FF4B2B", "#B01000"],
    blurb: "Classic heat, no apologies. Ask for dill ranch and thank yourself later.",
    spicy: true,
  },
  {
    name: "Coconut Caramel",
    hue: ["#F7C98B", "#B4661F"],
    blurb: "Toasted coconut folded into caramel. Sweet-salty, dangerously repeatable.",
    sweet: true,
  },
  {
    name: "Maple Brown Butter",
    hue: ["#FFB03A", "#8C4A0A"],
    blurb: "Browned butter, real maple. Breakfast and dinner shaking hands.",
    sweet: true,
  },
  {
    name: "Cinnamon Sugar Powder",
    hue: ["#F6D9B0", "#9C5A1E"],
    blurb: "Dusted like a churro, crunches like a tender. The dessert that isn't dessert.",
    sweet: true,
  },
];

export type Combo = { n: number; name: string; detail: string; price: number };

export const COMBOS: Combo[] = [
  { n: 1, name: "Obsession", detail: "1 Chicken Flavor • Fries", price: 9.95 },
  { n: 2, name: "Tender Combo", detail: "1 Chicken Flavor • Fries • Slaw", price: 12.95 },
  { n: 3, name: "Tender Flavor", detail: "2 Chicken Flavors • Fries • Slaw", price: 16.95 },
  { n: 4, name: "Deluxe", detail: "3 Chicken Flavors", price: 22.95 },
];

export type Item = { name: string; detail?: string; price: number; size?: string; img?: string };

export const SHAKE_PRICE = 6.25;

export const SHAKES: Item[] = [
  { name: "Matcha", price: SHAKE_PRICE, img: "/menu/shakes/matcha.png" },
  { name: "Vanilla", price: SHAKE_PRICE, img: "/menu/shakes/vanilla.png" },
  { name: "Chocolate", price: SHAKE_PRICE, img: "/menu/shakes/chocolate.png" },
  { name: "Strawberry", price: SHAKE_PRICE, img: "/menu/shakes/strawberry.png" },
];


export const SIDES: Item[] = [
  { name: "1 Chicken Flavor", detail: "Flavor of your choice", price: 7.95 },
  { name: "Fries", price: 3.95 },
  { name: "Slaw", price: 3.95 },
  { name: "Drinks", detail: "(Coca-Cola, Diet Coke, Sprite, Fanta, Water)", price: 3.25 },
];

export const EXTRA_SAUCE = 0.35;

export type Sauce = { name: string; note?: string };

export const SAUCES: Sauce[] = [
  { name: "Yuzu Soy" },
  { name: "Garlic Soy" },
  { name: "Tokyo Peking" },
  { name: "Buffalo", note: "Bold & Spicy" },
  { name: "Coconut Caramel" },
  { name: "Maple Brown Butter" },
  { name: "Cinnamon Sugar Powder" },
  { name: "Dill Ranch" },
];

export const SHOP = {
  name: "Tokyo Tenders",
  tagline: "Come hungry, leave happy",
  since: "Hatched 2026",
  street: "13083 Van Nuys Blvd",
  city: "Pacoima",
  state: "CA",
  zip: "91331",
  phone: "(818) 729-2929",
  phoneHref: "tel:+18187292929",
  email: "tokyotenders@gmail.com",
  opening: "Grand Opening 2026",
};

export const MAPS_URL = `https://maps.google.com/?q=${encodeURIComponent(
  `${SHOP.street}, ${SHOP.city} ${SHOP.state} ${SHOP.zip}`
)}`;

/** Marquee copy — carried over from the previous build. */
export const TICKER = [
  "100% Gluten-Free",
  "Tokyo-Inspired",
  "Made Fresh",
  "Crispy AF",
  SHOP.street,
  SHOP.phone,
  SHOP.opening,
];

export const STATS = [
  { n: "1", label: "Family recipe" },
  { n: "24hr", label: "Marinated fresh daily" },
  { n: "7", label: "Signature flavors" },
  { n: "100%", label: "Made with love" },
];

export const VIBE_TAGS = [
  "Crispy AF",
  "Local love",
  "Fresh daily",
  "Never frozen",
  "Street vibes",
  "Pacoima proud",
];

export const ALLERGEN =
  "Our food may contain or come in contact with common allergens including soy, eggs, dairy, sesame and tree nuts.";

export const money = (n: number) => n.toFixed(2);
