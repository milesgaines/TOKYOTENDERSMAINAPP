// The Tokyo Tenders menu — single source of truth for the site.
// Prices are numbers in dollars; the site formats them. Edit here, the whole page follows.

export type Flavor = {
  name: string;
  note?: string;
  /** Ingredient shot lifted from the printed menu. */
  img: string;
  /** Two-stop gradient the flavor picker paints the section with. */
  hue: [string, string];
  blurb: string;
  spicy?: boolean;
  sweet?: boolean;
};

export const FLAVORS: Flavor[] = [
  {
    name: "Yuzu Soy",
    img: "/menu/flavors/yuzu-soy.png",
    hue: ["#FFD24A", "#F08A00"],
    blurb: "Japanese citrus cut with soy — bright, sharp, gone in four bites.",
  },
  {
    name: "Garlic Soy",
    img: "/menu/flavors/garlic-soy.png",
    hue: ["#F0E6C8", "#B98A3E"],
    blurb: "Toasted garlic and dark soy. The one you order every time after the first time.",
  },
  {
    name: "Tokyo Peking",
    img: "/menu/flavors/tokyo-peking.png",
    hue: ["#C9873F", "#5A2A0C"],
    blurb: "Deep, lacquered, five-spice glaze. Peking duck energy on a tender.",
  },
  {
    name: "Buffalo",
    img: "/menu/flavors/buffalo.png",
    note: "Spicy",
    hue: ["#FF4B2B", "#B01000"],
    blurb: "Classic heat, no apologies. Ask for dill ranch and thank yourself later.",
    spicy: true,
  },
  {
    name: "Coconut Caramel",
    img: "/menu/flavors/coconut-caramel.png",
    hue: ["#F7C98B", "#B4661F"],
    blurb: "Toasted coconut folded into caramel. Sweet-salty, dangerously repeatable.",
    sweet: true,
  },
  {
    name: "Maple Brown Butter",
    img: "/menu/flavors/maple-brown-butter.png",
    hue: ["#FFB03A", "#8C4A0A"],
    blurb: "Browned butter, real maple. Breakfast and dinner shaking hands.",
    sweet: true,
  },
  {
    name: "Cinnamon Sugar Powder",
    img: "/menu/flavors/cinnamon-sugar-powder.png",
    hue: ["#F6D9B0", "#9C5A1E"],
    blurb: "Dusted like a churro, crunches like a tender. The dessert that isn't dessert.",
    sweet: true,
  },
];

export type Combo = { n: number; name: string; detail: string; price: number };

export const COMBOS: Combo[] = [
  { n: 1, name: "Tender Combo", detail: "1 chicken flavor / fries / slaw", price: 12.95 },
  { n: 2, name: "Tender Flavor", detail: "2 chicken flavors / fries / slaw", price: 16.95 },
  { n: 3, name: "Deluxe", detail: "3 chicken flavors", price: 22.95 },
  { n: 4, name: "Obsession", detail: "1 chicken flavor / 1 fry", price: 9.95 },
];

export type Item = { name: string; detail?: string; price: number; size?: string; img?: string };

export const SHAKES: Item[] = [
  { name: "Matcha", price: 6.25, size: "18 oz" },
  { name: "Vanilla", price: 6.25, size: "18 oz" },
  { name: "Chocolate", price: 6.25, size: "18 oz" },
  { name: "Strawberry", price: 6.25, size: "18 oz" },
];

export const SHAKE_LINEUP = "/menu/shakes/lineup.png";

export const SINGLES: Item[] = [
  { name: "Single Chicken", detail: "Flavor of your choice", price: 7.95 },
  { name: "Fries Alone", price: 3.95 },
  { name: "Cabbage Slaw", price: 3.95 },
  { name: "Shakes", price: 6.25 },
];

export type Sauce = { name: string; note?: string; color: string; spicy?: boolean; img: string };

export const SAUCES: Sauce[] = [
  { name: "Yuzu Soy", color: "#F5B233" , img: "/menu/sauces/yuzu-soy.png" },
  { name: "Garlic Soy", color: "#4A2E14" , img: "/menu/sauces/garlic-soy.png" },
  { name: "Tokyo Peking", color: "#3B1B08" , img: "/menu/sauces/tokyo-peking.png" },
  { name: "Peking Sweet", color: "#C0301A" , img: "/menu/sauces/peking-sweet.png" },
  { name: "Buffalo", note: "Spicy", color: "#E02214", spicy: true , img: "/menu/sauces/buffalo.png" },
  { name: "Coconut Caramel", color: "#B5762F" , img: "/menu/sauces/coconut-caramel.png" },
  { name: "Maple Brown Butter", color: "#71400F" , img: "/menu/sauces/maple-brown-butter.png" },
  { name: "Dill Ranch", color: "#F2EFE2" , img: "/menu/sauces/dill-ranch.png" },
];

export const DRINK_PRICE = 3.25;

export const DRINKS: Item[] = [
  { name: "Coca-Cola", price: DRINK_PRICE, size: "12 oz" , img: "/menu/drinks/coca-cola.png" },
  { name: "Diet Coke", price: DRINK_PRICE, size: "12 oz" , img: "/menu/drinks/diet-coke.png" },
  { name: "Sprite", price: DRINK_PRICE, size: "12 oz" , img: "/menu/drinks/sprite.png" },
  { name: "Fanta", price: DRINK_PRICE, size: "12 oz" , img: "/menu/drinks/fanta.png" },
  { name: "Mexican Coke", price: DRINK_PRICE, size: "12 oz" , img: "/menu/drinks/mexican-coke.png" },
  { name: "Bottled Water", detail: "Premium PET", price: DRINK_PRICE, size: "20 oz" , img: "/menu/drinks/bottled-water.png" },
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
  "Crispy AF",
  "Spicy Tenders",
  "Fresh Daily",
  "Garlic Pepper",
  SHOP.street,
  SHOP.phone,
  SHOP.opening,
];

export const STATS = [
  { n: "1", label: "Family recipe" },
  { n: "24hr", label: "Marinated fresh daily" },
  { n: "8", label: "Signature sauces" },
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
  "Our food may contain or come in contact with common allergens such as milk, eggs, soy, wheat, peanuts, or tree nuts. Please inform our staff of any food allergies before ordering.";

export const money = (n: number) => n.toFixed(2);
