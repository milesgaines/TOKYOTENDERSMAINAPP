import { NextResponse } from "next/server";
import {
  FLAVORS, COMBOS, SHAKES, SIDES, SAUCES, SHAKE_PRICE, EXTRA_SAUCE,
  STATS, VIBE_TAGS, ALLERGEN, SHOP,
} from "@/lib/menu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The menu, straight from lib/menu.ts — the same single source of truth the site renders.
// The iOS app fetches this so the in-app menu always matches the site.
export async function GET() {
  return NextResponse.json({
    version: 1,
    flavors: FLAVORS,
    combos: COMBOS,
    shakes: SHAKES,
    sides: SIDES,
    sauces: SAUCES,
    shakePrice: SHAKE_PRICE,
    extraSauce: EXTRA_SAUCE,
    stats: STATS,
    vibes: VIBE_TAGS,
    allergen: ALLERGEN,
    tagline: SHOP.tagline,
  });
}
